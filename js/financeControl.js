import { animationNumber, convertStringNumber } from './helpers.js';
import { addOperation, getData } from './services.js';

const financeForm = document.querySelector('.finance__form');
const financeAmount = document.querySelector('.finance__amount');
const financeCurrency = document.querySelector('.finance__currency');


window.currentCurrency = 'UAH';

let amount = 0;
financeAmount.textContent = amount;

financeCurrency.onclick = function (e) {
  window.currentCurrency = e.target.value;
  financeAmount.textContent = `${amount.toLocaleString("uk-UK")} ${window.currentCurrency}`;
}

const addNewOperation =  async (e) => {
  e.preventDefault();

  const typeOperation = e.submitter.dataset.typeOperation;
  
  const financeFormDate = Object.fromEntries(new FormData(financeForm));
  financeFormDate.type = typeOperation;

  const newOperation = await addOperation('/finance', financeFormDate)

  const changeAmount = Math.abs(convertStringNumber(newOperation.amount));

  if (typeOperation === 'income') {
    amount += changeAmount;
  }

  if (typeOperation === 'expenses') {
    amount -= changeAmount;
  }

    animationNumber(financeAmount, amount);
    // financeAmount.textContent = `${amount.toLocaleString("uk-UK")} ${window.currentCurrency}`;
    financeForm.reset();
};

export const financeControl = async () => {
  const operations = await getData('/finance');

  amount = operations.reduce((acc, item) => {
    if (item.type === 'income') {
      acc += convertStringNumber(item.amount);
    }
    
    if (item.type === 'expenses') {
      acc -= convertStringNumber(item.amount);
    }
    return acc
  }, 0);

  animationNumber(financeAmount, amount);
// financeAmount.textContent = `${amount.toLocaleString("uk-UK")} ${window.currentCurrency}`;
  financeForm.addEventListener('submit',addNewOperation)
}