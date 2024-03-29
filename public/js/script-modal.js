
/***************confirm modal******************/

document.getElementById('openModal').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('overlay').style.pointerEvents='all';
    document.getElementById('overlay').style.opacity= 1;
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});

// document.getElementById('cancel').addEventListener('click', function() {
//     document.getElementById('modal').style.display = 'none';
//     document.getElementById('overlay').style.display = 'none';
// });
document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});

document.getElementById('useAddress').addEventListener('click',function(){
   
   alert("successfully added this address!")
})

document.getElementById('payMethod').addEventListener('click',function(){
   
    alert("successfully added this payment method!")
})

/************ product display************ */
function updateMainImage(imageUrl) {
    document.getElementById('mainImage').src = "../upload/" + imageUrl;
    imageZoom(mainImage, myresult)
}

/************ show/hide zoom result************ */
function showResult() {
    const resultDiv = document.getElementById('myresult');
    resultDiv.style.visibility = 'visible';
    
    // Perform zooming logic here (if needed)
}

function hideResult() {
    const resultDiv = document.getElementById('myresult');
    resultDiv.style.display = 'none';
    
    // Perform zooming logic here (if needed)
}
//onmouseover=/* "showResult();imageZoom('mainImage', 'myresult')" */

document.getElementById('mainImage').addEventListener('mouseleave', hideResult);


/**************image zooming****************/
function imageZoom(imgID, resultID) {    
    var img, lens, result, cx, cy;
    img = document.getElementById(imgID);
    result = document.getElementById(resultID);
    /* Create lens: */
    lens = document.createElement("DIV");
    lens.setAttribute("class", "img-zoom-lens");
    /* Insert lens: */
    img.parentElement.insertBefore(lens, img);
    /* Calculate the ratio between result DIV and lens: */
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    /* Set background properties for the result DIV */
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    /* Execute a function when someone moves the cursor over the image, or the lens: */
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);
    /* And also for touch screens: */
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);
    function moveLens(e) {
      var pos, x, y;
      /* Prevent any other actions that may occur when moving over the image */
      e.preventDefault();
      /* Get the cursor's x and y positions: */
      pos = getCursorPos(e);
      /* Calculate the position of the lens: */
      x = pos.x - (lens.offsetWidth / 2);
      y = pos.y - (lens.offsetHeight / 2);
      /* Prevent the lens from being positioned outside the image: */
      if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
      if (x < 0) {x = 0;}
      if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
      if (y < 0) {y = 0;}
      /* Set the position of the lens: */
      lens.style.left = x + "px";
      lens.style.top = y + "px";
      /* Display what the lens "sees": */
      result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }
    function getCursorPos(e) {
      var a, x = 0, y = 0;
      e = e || window.event;
      /* Get the x and y positions of the image: */
      a = img.getBoundingClientRect();
      /* Calculate the cursor's x and y coordinates, relative to the image: */
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      /* Consider any page scrolling: */
      x = x - window.pageXOffset;
      y = y - window.pageYOffset;
      return {x : x, y : y};
    }
  }


  /**************wishlist button************** */
  alert("button")
  function clickWishButton(event){
    console.log("buton")
  
    document.getElementById("wish-but").style.color='red';
    // document.getElementById("wish-but").style.border='none';
  
  }

    /**************search bar on header************** */
    function getSearchValue(){
         const search = document.getElementById('ser-bar').value;
        console.log(search); 
        fetch('/getSearchValue', {
            method: 'POST',
          //  agent: new https.Agent({ rejectUnauthorized: false }),
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ search: search })
        })
        .then(response => {
            if (response.ok) {
                // Handle the HTML response
                return response.text(); 
               // Parse the response as text (HTML)
            } else {
                throw new Error('Failed to fetch HTML');
            }
        })
        .then(data => {
            console.log('Received search results:', data);
            window.location.href = '/searchProducts?searchData=' + encodeURIComponent(JSON.stringify(data));
        })
        // .then(html => {
        //     // Display the HTML response on the page
        //     document.getElementById('container').innerHTML = html;
        // })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    // $('#ser-bar').keyup(function() {
    //     // Get selected values from dropdowns
    //     console.log("in event" );
    //     const searchValue = $('#ser-bar').val();
       
    //     console.log(searchValue );
       
    //     // Send selected values to server
    //     $.ajax({
    //         url: '/getSerachValue', // Change this URL to match your server route
    //         method: 'POST',
    //         data: {
    //             search:  searchValue               
    //         },
    //         success: function(response) {
    //             // Handle success response
    //             console.log('Server response:', response);
    //         },
    //         error: function(xhr, status, error) {
    //             console.error('Error:', error);
    //         }
    //     });
    // });


    

