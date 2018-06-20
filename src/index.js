import './assets/main.css';
import './assets/popover.css';
import 'react-select/dist/react-select.css';
import "react-table/react-table.css";

import '@leanix/reporting';

import { Report } from './Report';

// Start with info hidden
$('#info').hide();

// When backdrop is clicked, hide backdrop and info, unlock document scroll
$('#backdrop').on('click', function() {
  $('#backdrop').toggleClass('modal-backdrop in');
  $('#info').hide();
  document.body.style.overflowY = 'scroll';
});

lx.init()
.then(function (setup) {
  let report = new Report(setup);
  let config = report.createConfig();
  lx.ready(config);
  report.init()
});
