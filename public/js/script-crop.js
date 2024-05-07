//handling image preview
function handleFileInputChange(event) {
    
    const files = event.target.files; // Get the selected files
    console.log(files);
    // Iterate through each file
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader(); // Create a new FileReader instance

        // Define a callback function to handle the FileReader's onload event
        reader.onload = function(event) {
            const imgSrc = event.target.result; // Get the base64 data URL of the image
            const imgIndex = i + 1; // Index of the image (e.g., img1, img2, etc.)
            const inputImgId = `inputImg${imgIndex}`; // ID of the input image element
            const imgElement = document.getElementById(inputImgId); // Get the input image element

            // Set the src attribute of the input image element to display the preview
            imgElement.src = imgSrc;

            // Show the image container
            const imgContainerId = `imgdiv${imgIndex}`;
            document.getElementById(imgContainerId).style.visibility = 'visible';
           
            initializeCropperForImage(i + 1);
        };

        // Read the selected file as a data URL (base64)
       
        reader.readAsDataURL(files[i]);
        
    }

}

//crop images
const croppers = [];

function initializeCropperForImage(inputIndex) {
    const imageId = `inputImg${inputIndex}`;
    console.log(imageId);
    const cropper = new Cropper(document.getElementById(imageId), {
        // Add Cropper.js options here
        aspectRatio: 0,
        viewMode: 0,
       
    });
    console.log(cropper);

    // Save cropper instance
    croppers[inputIndex - 1] = cropper;
    console.log(cropper)
}

const croppedImages = []; // array to store cropped images
// Function to handle image cropping
function cropImage(index) {   
    const cropper = croppers[index - 1];
    console.log(cropper)
    // Listen for crop event   
        if(cropper){
            console.log("canvas");
            const canvas = cropper.getCroppedCanvas();
            console.log(canvas);
            if(canvas){
                // const imgDataUrl ;

                const fieldname = `croppedImg${index}`;
                document.getElementById(fieldname).src = canvas.toDataURL("image/png");
                croppedImages.push({ fieldName: fieldname, dataUrl: canvas.toDataURL("image/png") }); // Push object containing field name and data URL
            } else {
                console.error("Failed to get cropped canvas.");
            }
        } else {
            console.error("Cropper object is not initialized.");
        }
    
}

// Function to handle the upload of cropped images
function uploadCroppedImages() {
    // Get the number of cropped images
    const numImages = 3; // Assuming you have 3 cropped images
    
    // Loop through each cropped image
    for (let i = 1; i <= numImages; i++) {
        const croppedImgElement = document.getElementById(`croppedImg${i}`);
        const imageDataUrl = croppedImgElement.src;

        // Only upload if the image data URL is not empty
        if (imageDataUrl) {
            uploadImage(imageDataUrl, i);
        }
    }
}

// Function to upload a single image to the server
function uploadImage(imageDataUrl, index) {
    // Convert Data URL to Blob
    const byteString = atob(imageDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });

    // Create FormData and append image file
    const formData = new FormData();
    formData.append('croppedImage', blob, `croppedImage${index}.png`);

    // Send the FormData to the server
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed
        console.log('Image uploaded:', data);
    })
    .catch(error => {
        console.error('Error uploading image:', error);
    });
}

// Function to submit the form with product details and uploaded image URLs to MongoDB
function submitFormWithImages() {
    // Upload cropped images if not already uploaded
    uploadCroppedImages();

    // Extract product details from the form
    const form = document.getElementById('product-form');
    const formData = new FormData(form);
    
    const productDetails = {
        name: formData.get('name'),
        category:document.getElementById('categoryID').value,
        seller:document.getElementById('sellerID').value,
        discount:document.getElementById('discountID').value,
        description: formData.get('description'),
        stock: parseFloat(formData.get('stock')),
        price: parseFloat(formData.get('price')),
        material:document.getElementById('materialID').value,
        color:document.getElementById('colorID').value,
        size:parseFloat(formData.get('size')),
        weight:parseFloat(formData.get('weight')),
        
        // Add more fields as needed
    };

    // Combine product details with uploaded image URLs
    const dataToSend = {
        productDetails: productDetails,
        imageUrls: croppedImages.map(image => image.dataUrl)
    };

    // Send data to the server to store in MongoDB
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed
        console.log('Data submitted:', data);
        // Optionally, redirect or show a success message
    })
    .catch(error => {
        console.error('Error submitting form:', error);
    });
}



// Function to handle image upload

function handleImageUpload(event){

    const cropper = croppers[index];
    if (!cropper) {
        console.error("Cropper instance not found.");
        return;
    }

    // Get the cropped canvas
    const canvas = cropper.getCroppedCanvas();

    // Convert canvas to Blob representing the cropped image (e.g., PNG format)
    canvas.toBlob(blob => {
        // Create a FormData object to store the cropped image
        const formData = new FormData();
        formData.append("croppedImage", blob, "cropped_image.png"); // Adjust filename and MIME type as needed

        // Send a POST request to upload the cropped image to the server
        fetch("/upload-cropped-image", {
            method: "POST",
            body: JSON.stringify({ croppedImages: croppedImageURLs }), // Adjust data format as needed
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server (e.g., get the uploaded cropped image URL)
            const croppedImageURLs = data.croppedImageURLs;

            // Add the cropped image URL to the product details form (hidden input field or another method)

            // Example: Set the value of a hidden input field with the cropped image URL
            // const croppedImageUrlInput = document.getElementById("croppedImageUrlInput");
            // croppedImageUrlInput.value = croppedImageUrl;
        })
        .catch(error => {
            console.error("Error uploading cropped image:", error);
        });
    }, "image/png"); 
}

function handleSubmit(event) {
    event.preventDefault();

    // Get the product details from the form
    const formData = new FormData(event.target);

    // Add the array of cropped image URLs to the form data
    formData.append("croppedImageURLs", JSON.stringify(croppedImageURLs)); // Adjust key name as needed

    // Send a POST request to submit the product details to the server
    fetch("/submit-product", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server (e.g., show a success message)
        console.log("Product submitted successfully:", data);
    })
    .catch(error => {
        console.error("Error submitting product:", error);
    });
}


document.getElementById("addButton").addEventListener("click", function() {
    // Submit form when add button is clicked
    document.getElementById("product-form").submit();
});

document.getElementById("uploadButton").addEventListener("click", function() {
    // Trigger file upload when upload button is clicked
    document.getElementById("product-form").action = "/upload-cropped-images";
    document.getElementById("product-form").submit();
});


function uploadImages() {
    // Iterate through all Cropper instances
    for (let i = 0; i < croppers.length; i++) {
        // Get cropped canvas and convert to blob
        const canvas = croppers[i].getCroppedCanvas();
        canvas.toBlob((blob) => {
            // Create FormData object and append blob
            const formData = new FormData();
            formData.append('image', blob, `image_${i+1}.jpg`);

            // Perform AJAX request to upload image
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Image ${i+1} uploaded successfully`);
                } else {
                    console.error(`Error uploading image ${i+1}`);
                }
            })
            .catch(error => {
                console.error(`Error uploading image ${i+1}:`, error);
            });
        }, 'image/jpeg');
    }
}