
const isAuthenticated = async (req, res, next)=>{
    try {
      if ((req.session.verified || req.session.user)&& !req.session.blocked) {
        // User is logged in, proceed to the next middleware
        next();
      } else {
        // User is not logged in, redirect to the login page with an error message
        req.flash("errorMessage", "Please log in !!.");
       // console.log("is authenticated?")
       res.redirect("/signin/userLogin")
        // res.redirect("/index");
        
      }
   
     
    } catch (error) {
      console.log(error.message);
    }
      
  }
  
  const isLoggedOut = async (req,res,next) => {
    try {
      if (req.session && req.session.user) {
        // User is logged in, redirect to the login page
        res.redirect("/index");
      } else {
        // User is not logged in, redirect to the login page with an error message
        next();
      }
     
      
    } catch (error) {
      console.log(error.message);
    }
    
  }

  const isAdminLogged = async(req,res)=>{
    try {
      if (req.session && req.session.user && req.session.role) {
        // User is logged in, redirect to the login page
        res.redirect("/dashboard");
      } else {
        // User is not logged in, redirect to the login page with an error message
        next();
      }
      
    } catch (error) {
      console.log(error.message);
    }
    
  } 

 
    module.exports = {
      isAuthenticated,
      isLoggedOut,
      isAdminLogged,
     }

