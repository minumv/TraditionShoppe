        
    const nameError = document.getElementById('name-error')
	const phoneError = document.getElementById('phone-error')
	const pinError = document.getElementById('pin-error')
    const houseError = document.getElementById('house-error')
    const streetError = document.getElementById('street-error')
    const landmarkError = document.getElementById('landmark-error')
    const cityError = document.getElementById('city-error')
    const stateError = document.getElementById('state-error')
    const countryError = document.getElementById('country-error')
	const stockError = document.getElementById('stock-error')
	const descriptionError = document.getElementById('description-error')
	const sizeError = document.getElementById('size-error')
	const weightError = document.getElementById('weight-error')
	const priceError = document.getElementById('price-error')
	const discountError = document.getElementById('discount-error')
	const couponError = document.getElementById('coupon-error')
	const minpurchError = document.getElementById('minpurch-error')
	const maxamtError = document.getElementById('maxamt-error')	 
  

	function validateName(){
		const name = document.getElementById('name').value
	
		if(name.length === 0){
			nameError.innerHTML = 'Name is required'
			return false
		}
		if(!name.match(/^[a-zA-Z][a-zA-Z\s]*$/)){
			nameError.innerHTML = 'Name should be valid'
			return false
		}
		nameError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

	function validateHouse(){	
		const house = document.getElementById('house').value
	

		if(house.length === 0){
			houseError.innerHTML = 'House is required'
			return false
		}
		if(!house.match(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?][a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)){
			houseError.innerHTML = 'House should be valid'
			return false
		}
		houseError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

	function validateMobile(){	
		const phone = document.getElementById('mobile').value	

		if(phone.length === 0){
			phoneError.innerHTML = 'Mobile no is required'
			return false
		}
		if(phone.length !== 10){
			phoneError.innerHTML = 'Mobile no should be 10 digits'
			return false
		}
		if(!phone.match(/^[0-9]{10}$/)){
			phoneError.innerHTML = 'Only digits'
			return false
		}
		phoneError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

	function validatePin(){

		const pin = document.getElementById('pin').value
	
		if( pin.length === 0){
			pinError.innerHTML = 'Pincode required'
			return false
		}
        if(pin.length !== 6){
			pinError.innerHTML = 'Pincode should be 6 digits'
			return false
		}
		if(!pin.match(/^[0-9]{6}$/)){
			pinError.innerHTML = 'Only digits'
			return false
		}
		
		pinError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true

	}

	function validateStreet(){
		const street = document.getElementById('street').value
		
		if(street.length === 0){
			streetError.innerHTML = 'Street required'
			return false
		}
		if(!street.match(/^[a-zA-Z][a-zA-Z\s]*$/)){
			streetError.innerHTML = 'Street must be valid'
			return false
		}
		streetError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

	function validateTown(){
		const city = document.getElementById('city').value
		
		if(city.length === 0){
			cityError.innerHTML = 'City required'
			return false
		}
		if( !city.match(/^[a-zA-Z][a-zA-Z\s]*$/)){
			cityError.innerHTML = 'City must be valid'
			return false
		}
		cityError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
    function validateState(){
		const state = document.getElementById('state').value
		
		if(state.length === 0){
			stateError.innerHTML = 'State required'
			return false
		}
		if(!state.match(/^[a-zA-Z][a-zA-Z\s]*$/)){
			stateError.innerHTML = 'State must be valid'
			return false
		}
		stateError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
    function validateCountry(){
		const country = document.getElementById('country').value
		
		if( country.length === 0){
			countryError.innerHTML = 'Country required'
			return false
		}
		if( !country.match(/^[a-zA-Z][a-zA-Z\s]*$/)){
			countryError.innerHTML = 'Country must be valid'
			return false
		}
		countryError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
    function validateLandmark(){
		const landmark = document.getElementById('landmark').value
		
		if( landmark.length === 0){
			landmarkError.innerHTML = 'Landmark required'
			return false
		}
		if( !landmark.match(/^[a-zA-Z][a-zA-Z\s]*$/)){
			landmarkError.innerHTML = 'Landmark must be valid'
			return false
		}
		landmarkError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

  	function validateDescription(){
		const description = document.getElementById('description').value
	
		if(description.length === 0){
			descriptionError.innerHTML = 'Description is required'
			return false
		}

   		if(!description.match(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?][a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)){
			descriptionError.innerHTML = 'Description should be valid'
			return false
		}
		
		descriptionError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

  	function validateStock(){
		const stock = document.getElementById('stock').value
	
		if(stock.length === 0){
			stockError.innerHTML = 'Stock is required'
			return false
		}
		if(!stock.match(/^(?!0)\d{1,5}$/)){
			stockError.innerHTML = 'Stock should be valid'
			return false
		}
		stockError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
 	function validatePrice(){
		const price = document.getElementById('price').value
	
		if(price.length === 0){
			priceError.innerHTML = 'Price is required'
			return false
		}
		if(!price.match(/^(?!0)\d{1,4}(?:\.\d+)?$/)){
			priceError.innerHTML = 'Price should be valid'
			return false
		}
		priceError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

  	function validateSize(){
		const size = document.getElementById('size').value
	
		if(size.length === 0){
			sizeError.innerHTML = 'Size is required'
			return false
		}
		if(!size.match(/^(?!0)\d{1,4}(?:\.\d+)?$/)){
			sizeError.innerHTML = 'Size should be valid'
			return false
		}
		sizeError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}

  	function validateWeight(){
		const weight = document.getElementById('weight').value
	
		if(weight.length === 0){
			weightError.innerHTML = 'Weight is required'
			return false
		}
		if(!weight.match(/^(?!0)\d{1,4}(?:\.\d+)?$/)){
			weightError.innerHTML = 'Weight should be valid'
			return false
		}
		weightError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
	
	function validateCode(){
		const coupon = document.getElementById('coupon').value
	
		if(coupon.length === 0){
			couponError.innerHTML = 'Coupon is required'
		 	//couponError.style.display = 'block';
			return false
		}
		if(!coupon.match(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/)){
			couponError.innerHTML = 'Coupon should be valid'
		 	//couponError.style.display = 'block';
			return false
		}
		couponError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
  function validateDisPer(){
		const percentage = document.getElementById('percentage').value
	
		if(percentage.length === 0){
			discountError.innerHTML = 'Discount is required'
			return false
		}  
		if(!percentage.match(/^(?!0(?:\.0+)?$)(?:100(?:\.0+)?|\d{0,2}(?:\.\d+)?)$/)){
	  		discountError.innerHTML = 'Discount should be valid'
			return false
		}		
		discountError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
  
  	function validateMinPurch(){
		const min_purch= document.getElementById('min_purch').value
	
		if(min_purch.length === 0){
			minpurchError.innerHTML = 'Amount is required'
			return false
		}
		if(!min_purch.match(/^(?!0)\d{1,4}(?:\.\d+)?$/)){
			minpurchError.innerHTML = 'Amount should be valid'
			return false
		}
		minpurchError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
   	function validateMaxDisc(){
		const max_amt= document.getElementById('max_amt').value
	
		if(max_amt.length === 0){
			maxamtError.innerHTML = 'Amount is required'
			return false
		}
		if(!max_amt.match(/^(?!0)\d{1,4}(?:\.\d+)?$/)){
			maxamtError.innerHTML = 'Amount should be valid'
			return false
		}
		maxamtError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
	function validateDisPerCoupon(){
		const discount_per = document.getElementById('discount_per').value
	
		if(discount_per.length === 0){
			discountError.innerHTML = 'Discount is required'
			return false
		}

		if(!discount_per.match(/^(?!0(?:\.0+)?$)(?:100(?:\.0+)?|\d{0,2}(?:\.\d+)?)$/)){
				discountError.innerHTML = 'Discount should be valid'
				return false
		}
		
		discountError.innerHTML = '<i class = "fas fa-check-circle"></i>'
		return true
	}
	

	function validateProduct() {
		const isNameValid = validateName();
		const isDescriptionValid = validateDescription();
		const isPriceValid = validatePrice();
		const isStockValid = validateStock();
		const isSizeValid = validateSize();
		const isWeightValid = validateWeight();
		return isNameValid && isDescriptionValid && isPriceValid && isStockValid && isSizeValid && isWeightValid;
	}
	function validateCategory() {
		const isNameValid = validateName();
		const isDescriptionValid = validateDescription();
		return isNameValid && isDescriptionValid;
	}
	function validateOffer() {
	   const isDiscountValid = validateDisPer();
	   return isDiscountValid ;
	}
  
    function validateForm() {
		const isNameValid = validateName();
		const isMobileValid = validateMobile();
		const isPinValid = validatePin();
		const isHouseValid = validateHouse();
		const isStreetValid = validateStreet();
		const isCityValid = validateTown();
		const isStateValid = validateState();
		const isCountryValid = validateCountry();
		const isLandmarkValid = validateLandmark();
    	return isNameValid && isMobileValid && isPinValid && isHouseValid && isStreetValid && isCityValid && isStateValid && isCountryValid && isLandmarkValid;
  }
 
	function validateCoupon() {
		const isCouponValid = validateCode();
		const isDiscountValid = validateDisPer();
		const isMinValid = validateMinPurch();
		const isMaxValid = validateMaxDisc();    
		return isCouponValid && isDiscountValid && isMinValid && isMaxValid ;
	}
	function validateCouponChange() {
		const isCouponValid = validateCode();
		const isDiscountValid = validateDisPerCoupon();
		const isMinValid = validateMinPurch();
		const isMaxValid = validateMaxDisc();    
		return isCouponValid && isDiscountValid && isMinValid && isMaxValid ;
	  }