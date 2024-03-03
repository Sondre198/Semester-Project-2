export function showMessageBox({title, details}) {
    const dialog = document.createElement("div")
    dialog.classList.add("modal")
    dialog.style.display = "block";
    dialog.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary">Ok</button>
        </div>
        </div>
    </div>`

    dialog.querySelector(".modal-title").innerText = title;
    dialog.querySelector(".modal-body").innerHTML = details;

    const buttons = [...dialog.getElementsByTagName("button")]
    buttons[0].onclick = () => dialog.remove();
    buttons[1].onclick = () => dialog.remove();

    document.body.append(dialog);
}

export function showNetworkError(error) {
    return showMessageBox({
        title: error.status,
        details: error.errors.map(e => e.message).join("<br/>")
    })
}