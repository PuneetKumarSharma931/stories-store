const moment = require('moment');

module.exports = {
    formatDate: (date, format)=>{

        return moment(date).format(format);
    },
    truncate: (str, len)=>{

        if(str.length > len && str.length > 0) {

            let new_str = str + ' ';

            new_str = str.substr(0, len);
            new_str = str.substr(0, new_str.lastIndexOf(' '));
            new_str = new_str.length > 0 ? new_str : str.substr(0, len);

            return new_str + '...';
        }

        return str;
    },
    stripTags: (input)=>{

        return input.replace(/<(?:.|\n)*?>/gm, '');
    },
    editIcon: (storyUser, loggedUser, storyId, floating = true) => {

        if(storyUser._id.toString() === loggedUser._id.toString()) {

            if(floating) {

                return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
            }
            else {

                return `<a href="/stories/edit/${storyId}"><i class="fas fa-edit"></i></a>`;
            }
        }
        else {
            return '';
        }
    },
    select: (selected, options)=>{

        return options
        .fn(this)
        .replace(
            new RegExp(' value="' + selected + '"'),
            '$& selected="selected"'
        )
        .replace(
            new RegExp('>' + selected + '</option>'),
            ' selected ="selected"$&'
        )
    },
    likeIcon: (likesCount, likedUsers, user) => {

        if(likedUsers.find((likedUser) => { return likedUser === user.id }) != undefined) {

            return `<button class="btn blue darken-1" ><i class="fa-solid fa-thumbs-up fa-large left"></i><span class="right"> ${likesCount}</span></button>`;
        }
        else {

            return `<button class="btn grey-darken-1" ><i class="fa-regular fa-thumbs-up fa-large left"></i><span class="right"> ${likesCount}</span></button>`;
        }
    },
    dislikeIcon: (dislikesCount, dislikedUsers, user) => {

        if(dislikedUsers.find((dislikedUser) => { return dislikedUser === user.id}) != undefined) {

            return `<button class="btn red darken-1" ><i class="fa-solid fa-thumbs-down fa-large left"></i><span class="right"> ${dislikesCount}</span></button>`;
        }
        else {

            return `<button class="btn grey-darken-1" ><i class="fa-regular fa-thumbs-down fa-large left"></i><span class="right"> ${dislikesCount}</span></button>`;
        }
    },
    showCommentButton: (comments, user, storyId) => {

        if(comments.find((comment) => { return comment.userId === user.id }) != undefined) {

            return `<h6>You have commented on this Story!</h6>`;
        }
        else {

            return `<a href="/stories/comments/${storyId}" class="btn green darken-2 mt">Add Comment</a>`;
        }
    },
    showCommentMoreVert: (story, userCommentId, user) => {

        if(userCommentId.toString() === user._id.toString()) {

            return `<div class="dropdown" data-dropdown>
            <p style="font-size: 30px; cursor: pointer;" class="more_vert" data-dropdown-button>&#8942;</p>
            <div class="dropdown-menu">
                <form action="/stories/comments/edit/${story._id}/${userCommentId}" method="GET" id="edit-comment-form">
                <button type="submit" class="btn-small blue darken-2" style="width: 100%; margin-bottom: .25rem;">Edit</button>
                </form>

                <form action="/stories/comments/delete/${story._id}/${userCommentId}" method="POST" id="delete-comment-form">
                <input type="hidden" name="_method" value="DELETE">
                <button class="btn-small red darken-2" style="width: 100%;">Delete</button> 
                </form>
            </div>
        </div>`;

        }
    }
}