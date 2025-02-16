function parseJWT(token){
  try{
  const base64Url = token.split('.')[1]; // we get the payload 

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // we replace the characters - and _ with + and /

  //atob() function decodes a string of data which has been encoded using base-64 encoding
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join('')); // we decode the base64 string and convert it to a JSON string  

    return JSON.parse(jsonPayload); // we parse the JSON string to a JavaScript object
  }catch(e){
    return null;
  }
}

function isTokenExpired(token){ 
 const decodeToken = parseJWT(token);
 if(!decodeToken || !decodeToken.exp){
   return true;
 }
  const currentTime = new Date().getTime() / 1000; // to get in seconds
  return decodeToken.exp < currentTime;
}

import { canNavigate } from '@layouts/plugins/casl'

export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(to => {
    /*
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         */
    if (to.meta.public) return;

    /**
         * Check if user is logged in by checking if token & user data exists in local storage
         * Feel free to update this logic to suit your needs
         */
    const isLoggedIn = !!(localStorage.getItem('user') && localStorage.getItem('token'))
    console.log(isLoggedIn);
 
    if(isLoggedIn && isTokenExpired(localStorage.getItem('token'))){
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return {
        name: 'login',
        query: {
            ...to.query,
            to: to.fullPath !== '/' ? to.path : undefined,
        },
      };
    }


    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'
      else
        return undefined
    }
    console.log(to);
    
    if(to.meta.not_autenticacion == false){
      return true;
    }
    
    if (!isLoggedIn && to.matched.length) {
      /* eslint-disable indent */
            return isLoggedIn
                ? { name: 'not-authorized' }
                : {
                    name: 'login',
                    query: {
                        ...to.query,
                        to: to.fullPath !== '/' ? to.path : undefined,
                    },
                }
            /* eslint-enable indent */
    }
  })
}
