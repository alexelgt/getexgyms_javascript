function triggerSideBar() {
    sidebarDiv = document.getElementById("sidebar");
    overlay = document.getElementById("sidebar-overlay");

    if (sidebarDiv.classList.contains("out")) {
        sidebarDiv.classList.remove("out");
        overlay.classList.remove("active");
        overlay.classList.add("semiactive");
        document.body.removeEventListener("touchmove", freezeVp, false);
        document.body.style.overflow = "visible";
        setTimeout(function(){
            overlay.classList.remove("semiactive");
        },200);
    }
    else {
        sidebarDiv.classList.add("out");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        document.body.addEventListener("touchmove", freezeVp, false);
    }

}

var freezeVp = function(e) {
    e.preventDefault();
};