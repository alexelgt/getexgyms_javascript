var scrollTop_whenSidebarOpen;

function triggerSideBar() {
    var sidebarDiv = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");

    if (sidebarDiv.classList.contains("out")) {
        sidebarDiv.classList.remove("out");
        overlay.classList.remove("active");
        overlay.classList.add("semiactive");
        document.body.style.position = "static";
        document.getElementById("structure").style.top = 0;
        document.body.scrollTop = scrollTop_whenSidebarOpen;
        setTimeout(function(){
            overlay.classList.remove("semiactive");
        },200);
    }
    else {
        sidebarDiv.classList.add("out");
        overlay.classList.add("active");
        scrollTop_whenSidebarOpen = document.body.scrollTop;
        document.body.style.position = "fixed";
        document.getElementById("structure").style.top = -scrollTop_whenSidebarOpen;
        window.scrollTo(0, 1);
    }

}