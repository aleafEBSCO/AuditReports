import './assets/main.css';
import './assets/popover.css';
import 'react-select/dist/react-select.css';

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
  var report = new Report(setup);
  lx.ready(report.config);
  report.init()
});
