import { useState } from 'react';

function Today() {
  
   const [plans, setPlans] = useState([]);
   const [currentPlan, setCurrentPlan] = useState(null);

   if (!currentPlan) {
    return (
    <>
     <div>
        Ready to start your day! Check your plans and get on track.
     </div>
     <button
      type = "button"
      onClick={() => setCurrentPlan({name: 'Plan A' })}
     >Plan A
   </button>
   </>)
   } 
    return (<div>{`Today's plan: ${currentPlan.name}`}</div>);
   
   
    
}

export default Today