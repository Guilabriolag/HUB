/* DESIGN SYSTEM LABSYSTEM */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { font-family: 'Plus Jakarta Sans', sans-serif; }

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

.sidebar-active {
    background-color: white !important;
    color: #1f298f !important;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.tab-section { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

#sidebar.mobile-open { transform: translateX(0); }

/* Phone Screen Simulation Styles */
#phone-screen { scrollbar-width: none; }
#phone-screen::-webkit-scrollbar { display: none; }

.preview-product-card {
    transition: transform 0.2s;
}
.preview-product-card:active { transform: scale(0.95); }

/* Inputs Adaptativos */
input, select, textarea { transition: all 0.2s; border: 2px solid transparent !important; }
input:focus { border-color: #1f298f !important; background: white !important; box-shadow: 0 5px 15px rgba(31,41,143,0.1); }
