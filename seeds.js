const Campground = require("./models/campground");
const Comment = require("./models/comment");

let data = [
    {
        name: "Cloud's Rest",
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Porttitor lacus luctus accumsan tortor posuere ac ut. Nulla facilisi etiam dignissim diam quis enim lobortis. Egestas integer eget aliquet nibh. Id diam vel quam elementum pulvinar etiam non. Vitae sapien pellentesque habitant morbi tristique senectus et netus. Tortor at auctor urna nunc id cursus metus aliquam. Sit amet consectetur adipiscing elit ut. Sem nulla pharetra diam sit amet nisl. Iaculis urna id volutpat lacus laoreet non curabitur."
    },
    {
        name: "Desert Mesa",
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Porttitor lacus luctus accumsan tortor posuere ac ut. Nulla facilisi etiam dignissim diam quis enim lobortis. Egestas integer eget aliquet nibh. Id diam vel quam elementum pulvinar etiam non. Vitae sapien pellentesque habitant morbi tristique senectus et netus. Tortor at auctor urna nunc id cursus metus aliquam. Sit amet consectetur adipiscing elit ut. Sem nulla pharetra diam sit amet nisl. Iaculis urna id volutpat lacus laoreet non curabitur."
    },
    {
        name: "Canyon Floor",
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Porttitor lacus luctus accumsan tortor posuere ac ut. Nulla facilisi etiam dignissim diam quis enim lobortis. Egestas integer eget aliquet nibh. Id diam vel quam elementum pulvinar etiam non. Vitae sapien pellentesque habitant morbi tristique senectus et netus. Tortor at auctor urna nunc id cursus metus aliquam. Sit amet consectetur adipiscing elit ut. Sem nulla pharetra diam sit amet nisl. Iaculis urna id volutpat lacus laoreet non curabitur."
    }
];

seedDB = () => {
    Campground.deleteMany({}, err => {
        if (err) {
            console.log(err);
        }
        console.log("removed campgrounds!");
        Comment.deleteMany({}, err => {
            if (err) {
                console.log(err);
            }
            console.log("removed comments!");
            data.forEach(seed => {
                Campground.create(seed, (err, campground) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("added a campground");
                        Comment.create(
                            {
                                text: "This place is great, but I wish there was internet",
                                author: "Homer"
                            },
                            (err, comment) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("Created new comment");
                                }
                            }
                        );
                    }
                });
            });
        });
    });
}

module.exports = seedDB;
