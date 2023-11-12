import { OverlayScrollbars } from './overlayscrollbars.esm.min.js';
import { deleteOperation, getData } from './services.js';
import { formatDate } from './helpers.js';
import { storage } from './storage.js';
import { financeControl } from './financeControl.js';
import { clearChart, generateChart } from './generateChart.js';

const financeReport = document.querySelector('.finance__report');
const report = document.querySelector('.report');
const reportOperationList = document.querySelector('.report__operation-list');
const reportTableAmount = document.querySelector('.report__table-amount'); 
const reportDates = document.querySelector('.report__dates');
const reportTable = document.querySelector('.report__table');
const generateChartButton = document.querySelector('#generateChartButton');


const typesOperation = {
  income: 'доход',
  expenses: 'расход'
}

let actualData = [];

const closeReport = ({ target }) => {
  if (
    target.closest('.report__close') ||
    (!target.closest('.report') && target !== financeReport)
  ) {

    gsap.to(report, {
      opacity: 0,
      scale: 0,
      duration: 1,
      ease: 'power1.in'
    })
    
    report.classList.remove('report__open');
    document.removeEventListener('click', closeReport); 
  }
  toggleKeyDownListener();
};

function closeReportByEsc () {
  gsap.to(report, {
      opacity: 0,
      scale: 0,
      duration: 1,
      ease: 'power1.in'
    })
  report.classList.remove('report__open');
  toggleKeyDownListener();
}

function onKeyPress(e) {
    if (e.key === 'Escape') {
        closeReportByEsc();
    }
}

function toggleKeyDownListener() {
    if (report.classList.contains('report__open')) {
        document.addEventListener('keydown', onKeyPress);
    } else {
        document.removeEventListener('keydown', onKeyPress);
    }
}

const openReport = () => {
  report.style.visibility = 'visible';

  gsap.to(report, {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power1.out'
  })

  report.classList.add('report__open'); 
  document.addEventListener('click', closeReport);
  toggleKeyDownListener()

  let currencies = reportTableAmount.innerHTML.split(',&nbsp;');
  if (currencies.length > 1) {
      reportTableAmount.innerHTML = currencies[0];
  }
  reportTableAmount.innerHTML += `,&nbsp;${window.currentCurrency}`;
};

const renderReport = (data) => {
  reportOperationList.textContent = '';

  const reportRows = data.map(({id, type, amount, description, category, date}) => {
    const reportRow = document.createElement('tr');
    reportRow.classList.add('report__row');
    reportRow.innerHTML = `
      <td class="report__cell">${category}</td>
      <td class="report__cell amount">${amount.toLocaleString("uk-UK")}</td>
      <td class="report__cell">${description}</td>
      <td class="report__cell">${formatDate(date)}</td>
      <td class="report__cell">${typesOperation[type]}</td>
      <td class="report__action-cell">
        <button
          class="report__button report__button_table" data-del=${id}>&#10006;</button>
      </td>
    `;

    return reportRow;
  })
  
  reportOperationList.append(...reportRows);
};

OverlayScrollbars(report, {
  // scrollbars: {
  //   theme: 'os-theme-custom'
  // }
});

export const reportControl = () => {
  reportTable.addEventListener('click', async ({ target }) => {
    const targetSort = target.closest('[data-sort]');

    if (targetSort) {
      const sortField = targetSort.dataset.sort;
    
      renderReport([...storage.data].sort((a, b) => {
        if (targetSort.dataset.dir === 'up') {
          [a, b] = [b, a]
        }
        
        if (sortField === 'amount') {
          return parseFloat(a[sortField]) < parseFloat(b[sortField]) ? -1 : 1;
        }
        return a[sortField] < b[sortField] ? -1 : 1
      }),
      );

      if (targetSort.dataset.dir === 'down') {
        targetSort.dataset.dir = 'up';
      } else {
        targetSort.dataset.dir = 'down';
      }
    }

    const targetDel = target.closest('[data-del]');
    if (targetDel) {
      await deleteOperation(`/finance/${targetDel.dataset.del}`);
      const deleteRow = targetDel.closest('.report__row');
      deleteRow.remove();
      financeControl()
      clearChart();
    }
  })

  financeReport.addEventListener('click', async () => {
    const textContent = financeReport.textContent;
    financeReport.textContent = 'Loading...';
    financeReport.disabled = true;

    actualData = await getData("/finance");
    storage.data = actualData; 
    financeReport.textContent = textContent;
    financeReport.disabled = false;

    renderReport(actualData);
    openReport();
  });
  
  reportDates.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dateFormData = Object.fromEntries(new FormData(reportDates));

    const searchParams = new URLSearchParams();
    if (dateFormData.startDate) {
      searchParams.append('startDate', dateFormData.startDate);
    }

    if (dateFormData.endDate) {
      searchParams.append('endDate', dateFormData.endDate);
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/finance?${queryString}` : '/finance';

    actualData = await getData(url);
    renderReport(actualData);
    clearChart();
  })
};

generateChartButton.addEventListener('click', () => {
  generateChart(actualData);
})