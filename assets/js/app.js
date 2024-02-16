

const cardContainer = document.getElementById('cardContainer');
const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('userId');
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
const loader = document.getElementById('loader');

let baseUrl = `https://jsonplaceholder.typicode.com/`
let posturl = `${baseUrl}/posts`
let postArray = []

const onEdit = (ele) => {
   
    // console.log(ele);
    let editId = ele.closest(".card").id;
    console.log(editId);
    localStorage.setItem('EditId', editId)
    let editUrl = `${baseUrl}/posts/${editId}`
    makeApiCall('GET', editUrl)
    window.scroll(0,0)
}

const onDelete = (ele) => {
    let deletedId = ele.closest('.card').id;
    let deletedUrl = `${baseUrl}/posts/${deletedId}`;
    // makeApiCall("DELETE", deletedUrl)
    Swal.fire({
        title: "Are you sure?",
        text: "This post is permantly deleted after click yes!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall("DELETE", deletedUrl)
          Swal.fire({
            title: "Deleted!",
            text: "Your posts has been deleted.",
            icon: "success"
          });
        }
      });
}

const createCard = (postObj) => {
    let card = document.createElement("div");
    card.className = 'card mb-4';
    card.id = postObj.id;
    card.innerHTML = `
                        <div class="card-header bg-primary text-white">
                             <h2>${postObj.title}</h2>
                        </div>
                        <div class="card-body">
                            <p>
                                ${postObj.body}
                            </p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-outline-primary btn-lg" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-outline-danger btn-lg" onclick="onDelete(this)">Delete</button>
                        </div>  
                    `
        cardContainer.append(card);
}
const templatingPosts = (arr) => {
    let result = ``
   arr.forEach(post => {
   result +=  `
                    <div class="card mb-4" id="${post.id}">
                        <div class="card-header bg-primary text-white">
                            <h2>${post.title}</h2>
                        </div>
                        <div class="card-body">
                            <p>
                                ${post.body}
                            </p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-outline-primary btn-lg" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-outline-danger btn-lg" onclick="onDelete(this)">Delete</button>
                        </div>
                    </div>
    
                `
   })
   cardContainer.innerHTML = result
}

const makeApiCall = (methodName, url, msgBody = null ) => {
    loader.classList.remove('d-none');
    let xhr = new XMLHttpRequest();

    xhr.open(methodName, url);

    xhr.send(JSON.stringify(msgBody));

    xhr.onload = function() {
        loader.classList.add('d-none');
        if(xhr.status >= 200 && xhr.status < 300){
            // console.log(xhr.response)
            if(methodName === 'GET'){

                postArray = JSON.parse(xhr.response);
                if(Array.isArray(postArray)){

                    templatingPosts(postArray)
                }else{
                    titleControl.value = postArray.title;
                    bodyControl.value = postArray.body;
                    userIdControl.value = postArray.userId
                    submitBtn.classList.add('d-none');
                    updateBtn.classList.remove('d-none');
                }
            }
            else if(methodName === "PUT"){
                // console.log(xhr.response)
                let id = JSON.parse(xhr.response).id;
                // console.log(id)
                let card = document.getElementById(id);
                console.log(card);
                let cardChild = [...card.children];
                // console.log(cardChild)
                cardChild[0].innerHTML = `<h2>${msgBody.title}</h2>`
                cardChild[1].innerHTML = `<p>${msgBody.body}</p>`
                postForm.reset();
                submitBtn.classList.remove('d-none');
                updateBtn.classList.add('d-none');
            }
            else if (methodName === "POST"){
                createCard(msgBody)
                Swal.fire({
                    title: "New Posts is created!",
                    icon: "success"
                  });
                postForm.reset();
            }
            else if (methodName === "DELETE"){
                let getIndex = url.indexOf('posts/');
                console.log(getIndex);
                let id = url.slice(getIndex + 6);
                console.log(id)
                document.getElementById(id).remove();
            }
        } 
    }
}

const onPostSubmit = (eve) => {
    eve.preventDefault();
    let obj = {
        title : titleControl.value,
        body : bodyControl.value,
        userId : userIdControl.value
    }
    console.log(obj)
    makeApiCall('POST', posturl, obj);
}
const onUpdateHandler = () =>{
    let updatedObj = {
        title : titleControl.value,
        body : bodyControl.value,
        userId : userIdControl.value
    }
    console.log(updatedObj)
    let updatedId = localStorage.getItem('EditId');
    console.log(updatedId);

    let updatedUrl = `${baseUrl}/posts/${updatedId}`

    // makeApiCall('PUT', updatedUrl, updatedObj);
    Swal.fire({
        title: "Do you want to update this post?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `No`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            makeApiCall('PUT', updatedUrl, updatedObj);
          Swal.fire("Successfully Updated", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
      
}

makeApiCall('GET', `${baseUrl}/posts`)

updateBtn.addEventListener('click', onUpdateHandler)
postForm.addEventListener('submit', onPostSubmit)