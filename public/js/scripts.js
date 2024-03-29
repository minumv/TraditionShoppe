/*global $, document, window, setTimeout, navigator, console, location*/
$(document).ready(function () {

    'use strict';

    var usernameError = true,
        emailError    = true,
        passwordError = true,
        passConfirm   = true;

    // Detect browser for css purpose
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        $('.form form label').addClass('fontSwitch');
    }

    // Label effect
    $('input').focus(function () {

        $(this).siblings('label').addClass('active');
    });

    // Form validation
    $('input').blur(function () {

        // User Name
        if ($(this).hasClass('name')) {
            if ($(this).val().length === 0) {
                $(this).siblings('span.error').text('Please type your full name').fadeIn().parent('.form-group').addClass('hasError');
                usernameError = true;
            } else if ($(this).val().length > 1 && $(this).val().length <= 6) {
                $(this).siblings('span.error').text('Please type at least 6 characters').fadeIn().parent('.form-group').addClass('hasError');
                usernameError = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                usernameError = false;
            }
        }
        // Email
        if ($(this).hasClass('email')) {
            if ($(this).val().length == '') {
                $(this).siblings('span.error').text('Please type your email address').fadeIn().parent('.form-group').addClass('hasError');
                emailError = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                emailError = false;
            }
        }

        // PassWord
        if ($(this).hasClass('pass')) {
            if ($(this).val().length < 8) {
                $(this).siblings('span.error').text('Please type at least 8 charcters').fadeIn().parent('.form-group').addClass('hasError');
                passwordError = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                passwordError = false;
            }
        }

        // PassWord confirmation
        if ($('.pass').val() !== $('.passConfirm').val()) {
            $('.passConfirm').siblings('.error').text('Passwords don\'t match').fadeIn().parent('.form-group').addClass('hasError');
            passConfirm = false;
        } else {
            $('.passConfirm').siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
            passConfirm = false;
        }

        // label effect
        if ($(this).val().length > 0) {
            $(this).siblings('label').addClass('active');
        } else {
            $(this).siblings('label').removeClass('active');
        }
    });


    // form switch
    $('a.switch').click(function (e) {
        $(this).toggleClass('active');
        e.preventDefault();

        if ($('a.switch').hasClass('active')) {
            $(this).parents('.form-peice').addClass('switched').siblings('.form-peice').removeClass('switched');
        } else {
            $(this).parents('.form-peice').removeClass('switched').siblings('.form-peice').addClass('switched');
        }
    });


    // Form submit
    $('form.signup-form').submit(function (event) {
        event.preventDefault();

        if (usernameError == true || emailError == true || passwordError == true || passConfirm == true) {
            $('.name, .email, .pass, .passConfirm').blur();
        } else {
            $('.signup, .login').addClass('switched');

            setTimeout(function () { $('.signup, .login').hide(); }, 700);
            setTimeout(function () { $('.brand').addClass('active'); }, 300);
            setTimeout(function () { $('.heading').addClass('active'); }, 600);
            setTimeout(function () { $('.success-msg p').addClass('active'); }, 900);
            setTimeout(function () { $('.success-msg a').addClass('active'); }, 1050);
            setTimeout(function () { $('.form').hide(); }, 700);
        }
    });

    // Reload page
    $('a.profile').on('click', function () {
        location.reload(true);
    });


});


//for handle dropdown

    // Function to select and aend dropdown options via AJAX
    $('#addButton').click(function() {
        // Get selected values from dropdowns
        const sellerValue = $('#sellerName').val();
        const categoryValue = $('#categoryName').val();       
        const discountValue = $('#discountName').val();
        const materialValue = $('#material').val();
        const colorValue = $('#color').val();
        const typeValue = $('#type').val();
        console.log( categoryValue, discountValue, colorValue,typeValue);
        console.log( $('#discountName').val());
        console.log($('#sellerName').val());
        console.log($('#material').val());
    
        // Send selected values to server
        $.ajax({
            url: '/getDropdownValues', // Change this URL to match your server route
            method: 'POST',
            data: {
                category: categoryValue,
                seller: sellerValue,
                discount: discountValue,
                material: materialValue,
                color: colorValue,
                product_type: typeValue
            },
            success: function(response) {
                // Handle success response
                console.log('Server response:', response);
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });

    $('#editButton').click(function() {
        // Get selected values from dropdowns
        const sellerValue = $('#sellerName').val();
        const categoryValue = $('#categoryName').val();       
        const discountValue = $('#discountName').val();
        const materialValue = $('#material').val();
        const colorValue = $('#color').val();
        const typeValue = $('#type').val();
        const statusValue = $('#status').val();
        const listValue = $('#list').val();
        console.log( categoryValue, discountValue, colorValue,typeValue);
        console.log( $('#discountName').val());
        console.log($('#sellerName').val());
        console.log($('#material').val());
    
        // Send selected values to server
        $.ajax({
            url: '/getDropdownEdit', // Change this URL to match your server route
            method: 'POST',
            data: {
                category: categoryValue,
                seller: sellerValue,
                discount: discountValue,
                material: materialValue,
                color: colorValue,
                product_type: typeValue,
                status: statusValue,
                list: listValue
            },
            success: function(response) {
                // Handle success response
                console.log('Server response:', response);
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });

   
/**************add address from checkout page************** */
$('#addAddress').click(function() {
    // Get selected values from dropdowns
    const stateValue = $('#state').val();
    const countryValue = $('#country').val();       
   console.log("state:"+stateValue);
   console.log("country:"+countryValue);

    // Send selected values to server
    $.ajax({
        url: '/getStateCountry', // Change this URL to match your server route
        method: 'POST',
        data: {
            country: countryValue,
            state: stateValue                
        },
        success: function(response) {
            // Handle success response
            console.log('Server response:', response);
           // addressSubmission();
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
});

  
/**************edit address from checkout page************** */
$('#editAddress').click(function() {
    // Get selected values from dropdowns
    const stateValue = $('#state').val();
    const countryValue = $('#country').val();       
   console.log("state:"+stateValue);
   console.log("country:"+countryValue);

    // Send selected values to server
    $.ajax({
        url: '/editStateCountry', // Change this URL to match your server route
        method: 'POST',
        data: {
            country: countryValue,
            state: stateValue                
        },
        success: function(response) {
            // Handle success response
            console.log('Server response:', response);
          
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
});

/***************saving checked radio button value******************/

$('input[type="radio"][name="address"]').change(function() {
    if ($(this).is(":checked")) {
        // Get the value of the selected radio button
        var selectedAddressId = $(this).val();
        console.log("Selected Address ID:", selectedAddressId);
        
        // Make an AJAX request to send the selected address ID to the server
        $.ajax({
            url: '/updateSelectedAddress', // Specify your server endpoint
            method: 'POST',
            data: { addressid: selectedAddressId },
            success: function(response) {
                console.log('Server response:', response);
                // Handle success response
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                // Handle error
            }
        });
    }
});

$('input[type="radio"][name="paymethods"]').change(function() {
    if ($(this).is(":checked")) {
        // Get the value of the selected radio button
        var payMethodSeletced = $(this).val();
        console.log("Selected pay method:", payMethodSeletced);
        
        // Make an AJAX request to send the selected address ID to the server
        $.ajax({
            url: '/updateSelectedMethod', // Specify your server endpoint
            method: 'POST',
            data: { paymethod: payMethodSeletced },
            success: function(response) {
                console.log('Server response:', response);
                // Handle success response
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                // Handle error
            }
        });
    }
});


