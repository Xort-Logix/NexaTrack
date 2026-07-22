const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });
}

if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebar);
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});


  $(function () {
      $('input[name="date"]').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month'),
        locale: { format: 'MM/DD/YYYY' }
      });
    });

    // ─── CLOCK STATE ───
    let clockState = {
      status: 'clocked-out', // 'clocked-out' | 'clocked-in' | 'on-lunch'
      startTime: null,
      timerInterval: null,
      elapsedSeconds: 0
    };

    const statusDot = document.getElementById('statusDot');
    const statusLabel = document.getElementById('statusLabel');
    const statusTimer = document.getElementById('statusTimer');
    const allToggleBtns = document.querySelectorAll('.clock-actions .toggle-btn');

    // Map status → display
    const statusMap = {
      'clocked-out': { label: 'Clocked Out', dotClass: 'clocked-out', labelClass: 'clocked-out' },
      'clocked-in': { label: 'Clocked In', dotClass: 'clocked-in', labelClass: 'clocked-in' },
      'on-lunch': { label: 'On Lunch', dotClass: 'on-lunch', labelClass: 'on-lunch' }
    };

    function updateUI() {
      const info = statusMap[clockState.status];
      statusDot.className = 'status-dot ' + info.dotClass;
      statusLabel.textContent = info.label;
      statusLabel.className = 'status-label ' + info.labelClass;

      // Highlight active toggle
      const actionMap = {
        'clocked-out': null,
        'clocked-in': 'clockin',
        'on-lunch': 'startlunch'
      };
      let activeAction = actionMap[clockState.status];

      allToggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (activeAction && btn.dataset.action === activeAction) {
          btn.classList.add('active');
        }
      });

      // Timer behavior:
      // - clocked-in: timer runs
      // - on-lunch: timer paused (interval cleared, elapsed preserved)
      // - clocked-out: timer stopped and reset to 0
      if (clockState.status === 'clocked-out') {
        // stop and reset
        if (clockState.timerInterval) {
          clearInterval(clockState.timerInterval);
          clockState.timerInterval = null;
        }
        clockState.elapsedSeconds = 0;
        statusTimer.textContent = formatTime(clockState.elapsedSeconds);
      } else if (clockState.status === 'on-lunch') {
        // pause (keep elapsedSeconds)
        if (clockState.timerInterval) {
          clearInterval(clockState.timerInterval);
          clockState.timerInterval = null;
        }
        statusTimer.textContent = formatTime(clockState.elapsedSeconds);
      } else if (clockState.status === 'clocked-in') {
        // running
        if (!clockState.timerInterval) {
          clockState.timerInterval = setInterval(() => {
            clockState.elapsedSeconds++;
            statusTimer.textContent = formatTime(clockState.elapsedSeconds);
          }, 1000);
        }
      }
    }

    function formatTime(sec) {
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return h + ':' + m + ':' + s;
    }

    // ─── HANDLE CLOCK ACTIONS ───
    function handleClockAction(action) {
      // Prevent invalid transitions
      if (action === 'clockin' && clockState.status !== 'clocked-out') {
        return;
      }
      if (action === 'startlunch' && clockState.status !== 'clocked-in') {
        return;
      }
      if (action === 'endlunch' && clockState.status !== 'on-lunch') {
        return;
      }
      if (action === 'clockout' && clockState.status === 'clocked-out') {
        return;
      }

      // Execute transition without resetting elapsed unless needed
      switch (action) {
        case 'clockin':
          // fresh clock in always starts from zero
          clockState.status = 'clocked-in';
          clockState.elapsedSeconds = 0;
          break;
        case 'startlunch':
          // pause timer, keep elapsed
          clockState.status = 'on-lunch';
          break;
        case 'endlunch':
          // resume from previous elapsed
          clockState.status = 'clocked-in';
          break;
        case 'clockout':
          // stop and reset
          clockState.status = 'clocked-out';
          clockState.elapsedSeconds = 0;
          break;
        default:
          return;
      }

      // Log for demo
      const actionLabels = {
        'clockin': 'Clock In',
        'startlunch': 'Start Lunch',
        'endlunch': 'End Lunch',
        'clockout': 'Clock Out'
      };
      console.log('🔔 ' + actionLabels[action] + ' → Status: ' + clockState.status);

      updateUI();
    }

    // ─── INIT ───
    updateUI();

    // ─── CHART: Attendance Trend ───
    const providerCtx = document.getElementById('providerChart');
    if (providerCtx) {
      new Chart(providerCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Production',
            data: [18000, 21000, 24650, 22800, 25200],
            backgroundColor: '#0d9488',
            borderRadius: 6
          }, {
            label: 'Net Pay',
            data: [5200, 6100, 7125, 6800, 7400],
            backgroundColor: '#4338ca',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { callbacks: { label: (c) => c.dataset.label + ': $' + c.parsed.y.toLocaleString() } }
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { callback: (value) => '$' + (value / 1000) + 'K' }
            }
          }
        }
      });
    }

    // ─── MAKE handleClockAction GLOBAL ───
    window.handleClockAction = handleClockAction;