import { useState, useEffect } from 'react';
import { getPlans } from '../services/api';

function Today() {
  
   const [plans, setPlans] = useState([]);
   const [currentPlan, setCurrentPlan] = useState(null);
   
   useEffect(() => {
     getPlans().then(setPlans);
   }, []);

   if (!currentPlan) {
    return (
    <>
     <div>
        Ready to start your day! Check your plans and get on track.
     </div>
     <div>
     {plans.map(plan => (
      <button 
      key={plan.id}
      onClick={() => setCurrentPlan(plan)}
      type="button"
      
      >
       {plan.name} - {plan.label}
       
      </button>
     ))}
     
   </div>
   </>)
   } 
    return (<div>{`Today's plan: ${currentPlan.name}`}</div>);
   
   
    
}

export default Today

