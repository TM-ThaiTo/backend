import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '@cloudinary/cloudinary.service';
import { UpdatePostDto, CreatePostDto } from '@/post/dto/index.dto';
import { STATUS_MESSAGE } from '@constants/index'
import { v4 as uuidv4 } from 'uuid';
import { PostAuth, HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandleLikePostDatabase } from '@/like-post/handle';
import { HandleFollowDatabase } from '@/follows/handle';
import { HandleBlockDB } from '@/setting/block/handle/handle.block.db';
import { typeNotification } from '@/utils/notification/typeNotifications';
import { NotificationService } from '@/notification/notification.service';
@Injectable()
export class PostService {

    constructor(
        private readonly postAuth: PostAuth,
        private readonly handlePostDatabase: HandlePostDatabase,
        private readonly cloudinaryService: CloudinaryService,
        private readonly handleUserDatabase: HandleUserDatabase,
        private readonly handleLikePostDatabase: HandleLikePostDatabase,
        private readonly handleFollowDatabase: HandleFollowDatabase,
        private readonly handleBlockDatabase: HandleBlockDB,
        private readonly notificationService: NotificationService,
    ) { }

    // fn: check người get có phải chủ bài viết hay nếu là khác thì có follow người đăng post không?
    async handleSet_IsMe_IsLike_IsFollow_byPostAndUserGet(post: any, userGet: any) {
        const userPost = await this.handleUserDatabase.findOneCustomerById(post?.idUser.toString());
        const idGet = userGet?._id.toString();
        const idUserPost = userPost?.id.toString();
        const idPost = post?._id?.toString();
        const isMe = userPost?.slug === userGet?.slug ? true : false;
        const isLike = await this.handleLikePostDatabase.findLikePostByIdUserAndIdPost(idGet, idPost) ? true : false;
        const isFollow = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(idGet, idUserPost) ? true : false;
        return { isMe, isLike, isFollow, userPost };
    }

    // fn: handle add info user not auth to post
    async handleAdd_User_Auth_Post_ToObject(item: any, userPost: any, isMe: boolean, isLike: boolean, isFollow: boolean) {
        const listUrlNew = item?.listUrl.map((urlItem: any) => {
            if (urlItem?.type === 1) {
                delete urlItem.thumbnail;
                delete urlItem.timeStart;
                delete urlItem.timeEnd;
                delete urlItem.soundOn;
            }
            return urlItem;
        });

        return {
            post: { ...item, listUrl: listUrlNew }, // Không cần toObject()
            user: userPost ? userPost.toObject() : null,
            auth: { isMe, isLike, isFollow },
        };
    }

    // fn: handle get post home
    async GetPostHome(page: number = 1, limit: number = 10, auth: any) {
        try {
            const { user } = auth;
            const idUserGet = user?._id?.toString();
            const skip = (page - 1) * limit;

            // Lấy bài viết từ database
            const posts = await this.handlePostDatabase.getPost(skip, limit);
            const totalPost = await this.handlePostDatabase.totalPost();
            const postAndInfoUser = [];
            for (const item of posts) {
                const checkBlock = await this.handleBlockDatabase.checkBlock(item?.idUser, idUserGet);
                if (checkBlock) continue;

                const itemNewPost = {
                    ...item,
                    hideLikes: item?.hideLikes === 1,
                    openComment: item?.openComment === 1,
                    openPublic: item?.status === 1,
                };
                const { userPost, isMe, isLike, isFollow } = await this.handleSet_IsMe_IsLike_IsFollow_byPostAndUserGet(itemNewPost, user);
                if (isMe || itemNewPost?.status === 1) {
                    const data = await this.handleAdd_User_Auth_Post_ToObject(
                        itemNewPost,
                        userPost,
                        isMe,
                        isLike,
                        isFollow
                    );
                    postAndInfoUser.push(data);
                }
            }
            const filteredPosts = postAndInfoUser.filter(post => post);
            return {
                code: 0,
                message: "Success",
                data: filteredPosts,
                count: filteredPosts.length,
                total: totalPost,
                page: Number(page),
                limit: Number(limit),
            };
        } catch (error) {
            console.error("Error in GetPostHome:", error);
            return {
                code: 1,
                message: "An error occurred",
                error: error.message || "Unknown error",
            };
        }
    }

    // fn: handle get post to profile
    async GetPostToProfile(slug: string, auth: any, page: number = 1, limit: number = 1) {
        try {
            const { account, user } = auth;
            var posts = null;
            const skip = (page - 1) * limit;

            const idUserGet = user?._id.toString();

            const author = await this.handleUserDatabase.findOneUserBySlug(slug);
            if (!author) throw new BadRequestException('User not found');

            const idAuthor = author?._id?.toString();

            const checkBlock = await this.handleBlockDatabase.checkBlock(idAuthor, idUserGet);
            if (checkBlock) throw new BadRequestException('Bạn đã bị chặn, hoặc không tìm thấy');

            if (slug === account?.userName) { // get my post is me ?
                posts = await this.handlePostDatabase.findAllPostByIdUser_NoStatusPostAndPage(idAuthor, page, limit);
            }

            if (slug !== account?.userName || !account) {
                posts = await this.handlePostDatabase.findMyPostPublic(idAuthor, 1, skip, limit);
            }
            return { code: 0, message: "Success get my Profile", data: posts }
        } catch (error) { throw error }
    }

    // async handleNotificatin
    handleNotifications(post: any, userCreate: string) {
        // Chạy tìm follower và tạo thông báo với timeout 30s
        const timeout = (ms: number) =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

        (async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Chờ 3 giây

                await Promise.race([
                    (async () => {
                        const idFollowers = await this.handleFollowDatabase.findAllFollowerByIdUser(userCreate);
                        if (!idFollowers || idFollowers.length === 0) return;

                        for (const item of idFollowers) {
                            const { idUser } = item;
                            const data = {
                                idUserCreate: userCreate,
                                type: typeNotification.CREATEPOST,
                                idUserReceive: idUser,
                                idContent: post?._id?.toString(), // Sử dụng slug hoặc post._id (nếu có)
                            };
                            await this.notificationService.create(data);
                        }
                    })(),
                    timeout(30000), // Giới hạn tối đa 30 giây
                ]);
            } catch (error) {
                console.error('Error fetching followers or timeout:', error);
            }
        })();
    }

    // fn: create image post
    async CreatePostStatusService(dto: CreatePostDto, auth: any) {
        try {
            const { user } = auth;
            const userCreate = user?._id?.toString();
            const content = dto.content;
            const slug = uuidv4();
            const dataSavePost = {
                idUser: user.id,
                status: 1,
                slug: slug,
                type: 3,
                title: 'status',
                content: content,
                listUrl: [],
                tag: [],
                collab: [],
                location: '',
                hideLikes: 0,
                openComment: 1,
            }
            const post = await this.handlePostDatabase.createPost(dataSavePost);

            this.handleNotifications(post, userCreate);

            return STATUS_MESSAGE.SUCCESS;
        } catch (error) { throw error }
    }

    // fn: create video post
    async CreatePostVideoService(req: any) {
        try {
            const { idUser, status, type, title, content, url, tag, collab, location, hideLikes, openComment } = req
            const { thumbnail, file, accessibility } = url;
            const { urlVideo, timeStart, timeEnd, width, height, soundOn } = file;
            const listUrl = [{
                type: 2,
                url: urlVideo,
                width: width,
                height: height,
                thumbnail: thumbnail,
                timeStart: Number(timeStart),
                timeEnd: Number(timeEnd),
                accessibility: accessibility,
                soundOn: soundOn === 'true' ? true : false,
            }];
            const slug = uuidv4();
            const dataSavePostVideo = {
                idUser: idUser,
                status: Number(status),
                slug: slug,
                type: Number(type),
                title,
                content: content,
                listUrl: listUrl,
                tag: tag,
                collab: collab,
                location: location,
                hideLikes: hideLikes ? 1 : 0,
                openComment: openComment ? 1 : 0,
            }
            const post = await this.handlePostDatabase.createPost(dataSavePostVideo);
            this.handleNotifications(post, idUser);
            return STATUS_MESSAGE.SUCCESS;
        } catch (error) { throw error }
    }

    async CreatePostImageOnly(dto: any, auth: any) {
        let uploadedMedia = [];
        try {
            const { user } = auth;
            const { collab, content, hideLikes, idUser, listUrl, location, openComment, status, tag, title, type } = dto;
            const userPost = user?._id.toString();

            // kiểm tra quyền đăng bài
            if (idUser !== userPost) throw new BadRequestException('Bạn không có quyền đăng bài tại người dùng này!');

            // upload image to cloudinary
            const listUrlImage = [];
            for (const item of listUrl) {
                const { accessibility, file } = item;
                const { base64 } = file;
                const upLoadImage = await this.cloudinaryService.uploadBase64(base64, 'image', idUser);
                const { secure_url, width, height, } = upLoadImage;
                const data = {
                    type, width, height, accessibility,
                    url: secure_url,
                }
                listUrlImage.push(data);
                uploadedMedia.push(secure_url);
            }

            // chuẩn bị data create
            const slug = uuidv4();
            const dataC = {
                idUser, slug, title, type, status, content, tag, collab, location,
                flag: 0, report: 0,
                listUrl: listUrlImage,
                hideLikes: hideLikes ? 1 : 0, likes: 0,
                openComment: openComment ? 1 : 0, comments: 0,
            }
            const newPost = await this.handlePostDatabase.createPost(dataC); // save

            this.handleNotifications(newPost, userPost);
            return {
                code: 200,
                message: 'Create Post Image Success',
            }
        } catch (error) {
            console.log('Error occurred, rolling back uploaded media:', error);
            if (uploadedMedia.length > 0) {
                await Promise.all(uploadedMedia.map(async (item) => { return this.cloudinaryService.deleteImage(item) }));
            }
            throw new Error('An error occurred while uploading files, all uploaded files have been rolled back.');
        }
    }

    // fn: get post by slug service
    async GetDetilPostBySlugAuth(slug: string, auth: any) {
        try {
            const { account } = auth;

            const post = await this.handlePostDatabase.findAllDataPostBySlug(slug);
            if (!post) throw new NotFoundException("Post not found");

            const userPost = await this.handleUserDatabase.findOneUserById(post?.idUser.toString());
            if (!userPost) throw new NotFoundException("User not found");

            const userGet = await this.handleUserDatabase.findOneUserBySlug(account?.userName);
            if (!userGet) throw new NotFoundException("Requesting user not found");

            const [isLikePost, isFollower] = await Promise.all([
                this.handleLikePostDatabase.findLikePostByIdUserAndIdPost(userGet?.id, post?.id),
                this.handleFollowDatabase.findOneFollowByIdAndIdFollow(userGet?.id, userPost?.id)
            ]);

            const isMe = userPost?.slug === account?.userName;
            const isLike = !!isLikePost;
            const isFollow = !!isFollower;

            let posts = await this.handlePostDatabase.findMyPostAllByIdUser(userPost?.id, 0, 6);
            let listPosts = posts.filter(item => item.id !== post.id);

            if (listPosts.length < 5) {
                const additionalPosts = await this.handlePostDatabase.findMyPostAllByIdUser(userPost?.id, 6, 1);
                posts = [...posts, ...additionalPosts];
                listPosts = posts.filter(item => item.id !== post.id);
            }

            listPosts = listPosts.slice(0, 5).map((item) => {
                const postCopy = item.toObject();
                if (!item.openComment) delete postCopy.comments;
                return postCopy;
            });

            if (isMe) {
                return {
                    auth: { isMe, isLike, isFollow },
                    user: userPost.toObject(),
                    post: post.toObject(),
                    posts: listPosts,
                };
            }
            const postCopy = post.toObject();
            if (post.openComment === 0) delete postCopy.comments;

            return {
                auth: { isMe, isLike, isFollow },
                user: userPost.toObject(),
                posts: listPosts,
                post: postCopy,
            };
        } catch (error) {
            if (error instanceof NotFoundException) { throw error; }
            throw new Error("An error occurred while fetching the post");
        }
    }

    // fn: handle get post to profile
    async GetPostToProfilePublic(slug: string, page: number = 1, limit: number = 1, auth: any) {
        try {
            const post = await this.handlePostDatabase.findOnePostBySlug(slug);
            var posts = null;
            const skip = (page - 1) * limit;
            posts = await this.handlePostDatabase.findMyPostPublic(post?.idUser, 1, skip, limit);

            const listPost = posts.map((item) => {
                const postCopy = item.toObject();
                if (!item.openLike) delete postCopy.likes;
                if (!item.openComment) delete postCopy.comments;
                return postCopy;
            });
            return { code: 0, message: "Success get my Profile", data: listPost }
        } catch (error) { throw error }
    }
    // fn: get detail post no auth
    async GetPostBySlugAuthNoAuth(slug: string) {
        const post = await this.handlePostDatabase.findOnePostBySlug(slug);
        if (!post) throw new NotFoundException("Post not found");
        const user = await this.handleUserDatabase.findOneUserById(post?.idUser.toString());

        const postCopy = { ...post.toObject() };
        if (!postCopy.openComment) {
            delete postCopy['comments'];
            const data = { user: user, post: postCopy };
            return { code: 0, message: "Success", data };
        }
        return {
            user: user,
            post: postCopy
        };
    }

    // fn: update post
    async UpdatePostService(req: UpdatePostDto, account: any) {
        return {};
    }

    // fn: update hide like
    async UpdateLikeService(slug: string, auth: any) {
        try {
            const { user } = auth;
            const post = await this.postAuth.checkAuthUpdatePost(slug, user);
            if (!post) return { code: 1, message: "Không tìm thấy bài viết hoặc không có quyền truy cập" };
            const oldHideLikes = post?.hideLikes;
            const updateHideLikes = oldHideLikes === 1 ? 0 : oldHideLikes === 0 ? 1 : 0;
            await post.updateOne({ hideLikes: updateHideLikes });
            const message = updateHideLikes === 0 ? "Đã hiện like" : "Đã ẩn like";
            return { code: 0, message };
        } catch (error) {
            console.error('UpdateLikeService error: ', error)
            throw new Error(`Error in UpdateLikeService: ${error.message}`);
        }
    }

    // fn: update hide comment
    async UpdateCommentService(slug: string, auth: any) {
        const { user } = auth;
        try {
            const post = await this.postAuth.checkAuthUpdatePost(slug, user);
            if (!post) return { code: 1, message: "Không tìm thấy bài viết hoặc không có quyền truy cập" };
            const oldComment = post?.openComment;
            const updateComment = oldComment === 1 ? 0 : oldComment === 0 ? 1 : 0;
            await post.updateOne({ openComment: updateComment });
            const message = updateComment === 0 ? "Đã ẩn comment" : "Đã hiện comment"
            return { code: 0, message }
        } catch (error) {
            console.error('UpdateCommentService error: ', error);
            throw new Error(`Error in UpdateCommentService: ${error.message}`);
        }
    }

    async UpdatePublicPostService(slug: string, auth: any) {
        const { user } = auth;
        try {
            const post = await this.postAuth.checkAuthUpdatePost(slug, user);
            const oldPublic = post?.status;
            const updateStatus = oldPublic === 1 ? 2 : oldPublic === 2 ? 1 : 1;
            await post.updateOne({ status: updateStatus });
            const message = updateStatus === 2 ? "Đã ẩn bài viết" : "Đã hiện bài viết"
            return { code: 0, message }
        } catch (error) { throw error }
    }

    // fn: delete post
    async DeletePostService(id: string, auth: any) {
        const { account } = auth;
        try {
            const post = await this.postAuth.checkAuthDeletePost(id, account);
            const urls = post?.listUrl.map((item) => {
                return item?.url;
            })
            await post.deleteOne();
            await Promise.all(urls.map(url => { return this.cloudinaryService.deleteImage(url); }));
            return STATUS_MESSAGE.SUCCESS
        }
        catch (error) { throw error };
    }

    // fn: get all post
    async GetAllPostService(page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;
            const posts = await this.handlePostDatabase.getPost(skip, limit);
            const totalPost = await this.handlePostDatabase.totalPost();
            return {
                code: 0,
                message: "Success",
                data: posts,
                count: posts.length,
                total: totalPost,
                page: page,
                limit: limit,
            };
        } catch (error) {
            console.error("Error in GetAllPostService:", error);
            return {
                code: 1,
                message: "An error occurred",
                error: error.message,
            }
        }
    }

    async getReels(page: number, limit: number, auth: any) {
        try {
            const { user } = auth;

            const idUserGet = user?._id.toString();
            const postReels = await this.handlePostDatabase.findPostVideoWithPublic(page, limit);

            const postAndInfoUser = [];
            for (const item of postReels) {
                const checkBlock = await this.handleBlockDatabase.checkBlock(item?.idUser, idUserGet);
                if (checkBlock) continue;

                const itemNewPost = {
                    ...item.toObject(),
                    hideLikes: item?.hideLikes === 1,
                    openComment: item?.openComment === 1,
                    openPublic: item?.status === 1,
                };
                const { userPost, isMe, isLike, isFollow } = await this.handleSet_IsMe_IsLike_IsFollow_byPostAndUserGet(itemNewPost, user);
                if (isMe || itemNewPost?.status === 1) {
                    const data = await this.handleAdd_User_Auth_Post_ToObject(
                        itemNewPost,
                        userPost,
                        isMe,
                        isLike,
                        isFollow
                    );
                    postAndInfoUser.push(data);
                }
            }

            const filteredPosts = postAndInfoUser.filter(post => post);
            return {
                code: 0,
                message: "Success",
                data: filteredPosts,
                count: filteredPosts.length,
                total: 10,
                page: Number(page),
                limit: Number(limit),
            };
        } catch (e) { throw e }
    }

    async getExplore(page: number, limit: number, auth: any) {
        try {
            const { user } = auth;
            const idUserGet = user?._id.toString();
            const postReels = await this.handlePostDatabase.findExplore(page, limit);

            const postAndInfoUser = [];
            for (const item of postReels) {
                const checkBlock = await this.handleBlockDatabase.checkBlock(item?.idUser, idUserGet);
                if (checkBlock) continue;

                const itemNewPost = {
                    ...item.toObject(),
                    hideLikes: item?.hideLikes === 1,
                    openComment: item?.openComment === 1,
                    openPublic: item?.status === 1,
                };
                const { userPost, isMe, isLike, isFollow } = await this.handleSet_IsMe_IsLike_IsFollow_byPostAndUserGet(itemNewPost, user);
                if (isMe || itemNewPost?.status === 1) {
                    const data = await this.handleAdd_User_Auth_Post_ToObject(
                        itemNewPost,
                        userPost,
                        isMe,
                        isLike,
                        isFollow
                    );
                    postAndInfoUser.push(data);
                }
            }

            const filteredPosts = postAndInfoUser.filter(post => post);
            return {
                code: 0,
                message: "Success",
                data: filteredPosts,
                count: filteredPosts.length,
                total: 10,
                page: Number(page),
                limit: Number(limit),
            };
        } catch (e) {
            throw e;
        }
    }
}