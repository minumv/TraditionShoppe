
const isAuthenticated = async (req, res, next)=>{
    try {
      if ((req.session.verified || req.session.user)&& !req.session.blocked) {
        // User is logged in, proceed to the next middleware
        next();
      } else {
        if (req.session.blocked) {
          res.redirect('/signin/userLogin?error=You are blocked by the admin!');
        } else {
            res.redirect('/signin/userLogin');
        }
       
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


  const isAdminAuthenticated = async (req, res, next)=>{
    try {
      if (req.session && req.session.admin) {
        // User is logged in, proceed to the next middleware
        next();
      } else {
        // User is not logged in, redirect to the login page with an error message
       // req.flash("errorMessage", "You are not authenticated to access this site!!");
       // console.log("is authenticated?")
       res.redirect("/admin/login")
        // res.redirect("/index");
        
      }
     
     
    } catch (error) {
      console.log(error.message);
    }
      
  }
  const isAdminLoggedOut = async(req,res,next)=>{
    try {
      if (req.session && req.session.admin) {
        // User is logged in, redirect to the login page
        res.redirect("/admin/login");
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
      isAdminAuthenticated,
      isAdminLoggedOut,
     }

