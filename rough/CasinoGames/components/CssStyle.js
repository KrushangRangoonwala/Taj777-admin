export function BetPopupCss() {
    return (
        <>
            <style>{`
          /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
    }

    header {
        display: block;
    }

    [tabindex="-1"]:focus:not(:focus-visible) {
        outline: 0 !important;
    }

    h5 {
        margin-top: 0;
        margin-bottom: .5rem;
    }

    button {
        border-radius: 0;
    }

    button:focus {
        outline: 1px dotted;
        outline: 5px auto -webkit-focus-ring-color;
    }

    button,
    input {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    button,
    input {
        overflow: visible;
    }

    button {
        text-transform: none;
    }

    [type=button],
    button {
        -webkit-appearance: button;
    }

    [type=button]:not(:disabled),
    button:not(:disabled) {
        cursor: pointer;
    }

    h5 {
        margin-bottom: .5rem;
        font-weight: 500;
        line-height: 1.2;
    }

    h5 {
        font-size: 1.25rem;
    }

    .form-control {
        display: block;
        width: 100%;
        height: calc(1.5em + .75rem + 2px);
        padding: .375rem .75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .form-control {
            transition: none;
        }
    }

    .form-control:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .form-control::placeholder {
        color: #6c757d;
        opacity: 1;
    }

    .form-control:disabled {
        background-color: #e9ecef;
        opacity: 1;
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        color: #212529;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: transparent;
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .btn {
            transition: none;
        }
    }

    .btn:hover {
        color: #212529;
        text-decoration: none;
    }

    .btn:focus {
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .btn:disabled {
        opacity: .65;
    }

    .btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
    }

    .btn-primary:focus {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-primary:disabled {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:not(:disabled):not(.disabled):active {
        color: #fff;
        background-color: #0062cc;
        border-color: #005cbf;
    }

    .btn-primary:not(:disabled):not(.disabled):active:focus {
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-link {
        font-weight: 400;
        color: #007bff;
        text-decoration: none;
    }

    .btn-link:hover {
        color: #0056b3;
        text-decoration: underline;
    }

    .btn-link:focus {
        text-decoration: underline;
        box-shadow: none;
    }

    .btn-link:disabled {
        color: #6c757d;
        pointer-events: none;
    }

    .btn-sm {
        padding: .25rem .5rem;
        font-size: .875rem;
        line-height: 1.5;
        border-radius: .2rem;
    }

    .close {
        float: right;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: .5;
    }

    .close:hover {
        color: #000;
        text-decoration: none;
    }

    .close:not(:disabled):not(.disabled):focus,
    .close:not(:disabled):not(.disabled):hover {
        opacity: .75;
    }

    button.close {
        padding: 0;
        background-color: transparent;
        border: 0;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    .modal-content {
        position: relative;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        width: 100%;
        pointer-events: auto;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, .2);
        border-radius: .3rem;
        outline: 0;
    }

    .modal-header {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-align: start;
        align-items: flex-start;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 1rem 1rem;
        border-bottom: 1px solid #dee2e6;
        border-top-left-radius: calc(.3rem - 1px);
        border-top-right-radius: calc(.3rem - 1px);
    }

    .modal-header .close {
        padding: 1rem 1rem;
        margin: -1rem -1rem -1rem auto;
    }

    .modal-title {
        margin-bottom: 0;
        line-height: 1.5;
    }

    .modal-body {
        position: relative;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        padding: 1rem;
    }

    .flex-fill {
        -ms-flex: 1 1 auto !important;
        flex: 1 1 auto !important;
    }

    .float-right {
        float: right !important;
    }

    .w-auto {
        width: auto !important;
    }

    .mt-0 {
        margin-top: 0 !important;
    }

    .ml-0 {
        margin-left: 0 !important;
    }

    .ml-2 {
        margin-left: .5rem !important;
    }

    .pr-0 {
        padding-right: 0 !important;
    }

    .pl-0 {
        padding-left: 0 !important;
    }

    .text-right {
        text-align: right !important;
    }

    .text-dark {
        color: #343a40 !important;
    }

    @media print {

        *,
        ::after,
        ::before {
            text-shadow: none !important;
            box-shadow: none !important;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/control.css */
    .form-control {
        background-color: #444;
        height: 36px;
        border-radius: 0;
        border: 1px solid #555;
        color: #ddd;
    }

    .form-control::placeholder {
        color: inherit;
        opacity: 1;
    }

    .form-control:focus,
    .form-control:hover {
        box-shadow: 0 0 4px var(--text-body);
        background-color: var(--bg-body);
        border: 1px solid var(--text-body);
        color: var(--text-body);
        box-shadow: none;
    }

    .btn {
        box-shadow: none !important;
        height: auto;
        color: var(--text-white);
        border-radius: 0;
    }

    .btn-primary {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:hover,
    .btn-primary:focus,
    .btn-primary:active,
    .btn-primary:not(:disabled):not(.disabled):active {
        box-shadow: none;
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:disabled {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
        cursor: not-allowed;
    }

    .btn-bet {
        height: 34px;
        background-color: var(--btn-primary);
        border-color: transparent;
        color: var(--text-white);
    }

    .btn-bet:hover,
    .btn-bet:focus,
    .btn-bet:active {
        background-color: var(--btn-primary) !important;
        border-color: transparent !important;
        color: var(--text-white) !important;
    }

    .modal-content {
        background-color: var(--bg-table);
        color: var(--text-table);
        border-radius: 0;
        border: 0;
        max-height: calc(100vh - 50px);
    }

    .modal-header {
        border: 0;
        border-radius: 0;
        background-color: var(--bg-table-header-new);
        color: var(--text-table-header-new);
        padding: 8px;
    }

    .modal-title {
        color: var(--text-fancy);
        font-size: var(--font-18);
    }

    .modal-header .close {
        color: var(--text-table-header-new);
        opacity: 1;
        text-shadow: none;
    }

    .modal-body {
        padding: 8px;
        max-height: calc(100vh - 60px);
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #666 #222;
    }

    .modal-body::-webkit-scrollbar {
        width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
        background: #666;
    }

    .modal-body::-webkit-scrollbar-thumb {
        background-color: #222;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/style.css */
    * {
        outline: 0 !important;
    }

    button,
    input {
        font-family: revert;
    }

    .back {
        background-color: var(--back);
    }

    .back:hover {
        background-color: var(--back-hover);
    }

    .back-border {
        border-left: 5px solid var(--back);
    }

    .bet-slip {
        border-bottom: 1px solid #666;
        padding: 0 4px;
        margin-bottom: 4px;
    }
        `}</style>

            <style>{`

                /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
    }

    img {
        vertical-align: middle;
        border-style: none;
    }

    button {
        border-radius: 0;
    }

    button:focus {
        outline: 1px dotted;
        outline: 5px auto -webkit-focus-ring-color;
    }

    button,
    input {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    button,
    input {
        overflow: visible;
    }

    button {
        text-transform: none;
    }

    button {
        -webkit-appearance: button;
    }

    button:not(:disabled) {
        cursor: pointer;
    }

    .form-control {
        display: block;
        width: 100%;
        height: calc(1.5em + .75rem + 2px);
        padding: .375rem .75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .form-control {
            transition: none;
        }
    }

    .form-control:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .form-control::placeholder {
        color: #6c757d;
        opacity: 1;
    }

    .form-control:disabled {
        background-color: #e9ecef;
        opacity: 1;
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        color: #212529;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: transparent;
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .btn {
            transition: none;
        }
    }

    .btn:hover {
        color: #212529;
        text-decoration: none;
    }

    .btn:focus {
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .btn:disabled {
        opacity: .65;
    }

    .btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
    }

    .btn-primary:focus {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-primary:disabled {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:not(:disabled):not(.disabled):active {
        color: #fff;
        background-color: #0062cc;
        border-color: #005cbf;
    }

    .btn-primary:not(:disabled):not(.disabled):active:focus {
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-link {
        font-weight: 400;
        color: #007bff;
        text-decoration: none;
    }

    .btn-link:hover {
        color: #0056b3;
        text-decoration: underline;
    }

    .btn-link:focus {
        text-decoration: underline;
        box-shadow: none;
    }

    .btn-link:disabled {
        color: #6c757d;
        pointer-events: none;
    }

    .btn-sm {
        padding: .25rem .5rem;
        font-size: .875rem;
        line-height: 1.5;
        border-radius: .2rem;
    }

    .flex-fill {
        -ms-flex: 1 1 auto !important;
        flex: 1 1 auto !important;
    }

    .float-right {
        float: right !important;
    }

    .w-auto {
        width: auto !important;
    }

    .text-right {
        text-align: right !important;
    }

    .text-dark {
        color: #343a40 !important;
    }

    @media print {

        *,
        ::after,
        ::before {
            text-shadow: none !important;
            box-shadow: none !important;
        }

        img {
            page-break-inside: avoid;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/control.css */
    .form-control {
        background-color: #444;
        height: 36px;
        border-radius: 0;
        border: 1px solid #555;
        color: #ddd;
    }

    .form-control::placeholder {
        color: inherit;
        opacity: 1;
    }

    .form-control:focus,
    .form-control:hover {
        box-shadow: 0 0 4px var(--text-body);
        background-color: var(--bg-body);
        border: 1px solid var(--text-body);
        color: var(--text-body);
        box-shadow: none;
    }

    .btn {
        box-shadow: none !important;
        height: auto;
        color: var(--text-white);
        border-radius: 0;
    }

    .btn-primary {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:hover,
    .btn-primary:focus,
    .btn-primary:active,
    .btn-primary:not(:disabled):not(.disabled):active {
        box-shadow: none;
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:disabled {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
        cursor: not-allowed;
    }



    .btn-bet {
        height: 34px;
        background-color: var(--btn-primary);
        border-color: transparent;
        color: var(--text-white);
    }

    .btn-bet:hover,
    .btn-bet:focus,
    .btn-bet:active {
        background-color: var(--btn-primary) !important;
        border-color: transparent !important;
        color: var(--text-white) !important;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/style.css */
    * {
        outline: 0 !important;
    }

    button,
    input {
        font-family: revert;
    }

    .lay {
        background-color: var(--lay);
    }

    .lay:hover {
        background-color: var(--lay-hover);
    }

    .lay-border {
        border-left: 5px solid var(--lay);
    }

    .bet-input {
        margin-top: 3px;
        margin-left: 4px;
        width: 120px;
        display: inline-block;
        vertical-align: top;
        position: relative;
        z-index: 0;
        overflow: hidden;
        height: 36px;
        margin: 0;
        margin-left: 0;
    }

    .bet-input.lay-border {
        border-left: 0;
    }

    .bet-input .form-control {
        color: #222;
        height: 36px;
        border: 0;
        background-color: #eee;
    }

    .casino-place-bet {
        width: 100%;
        border-radius: 0;
        margin-bottom: 4px;
    }

    .casino-place-bet-title {
        padding: 4px;
        text-transform: uppercase;
        font-weight: var(--font-bold);
    }

    .casino-place-bet-title .casino-min-max {
        text-transform: capitalize;
    }

    .casino-place-bet-header {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        padding: 8px;
        background-color: var(--bg-table-header-new);
        color: var(--text-table-header-new);
    }

    .casino-place-bet-box {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        padding: 6px 6px;
        color: #000;
        flex-wrap: wrap;
    }

    .casino-place-bet-box.lay:hover {
        background-color: var(--lay);
    }

    .casino-place-bet-info {
        display: flex;
        display: -webkit-flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }

    .casino-place-bet-info .bet-input {
        width: 80px;
    }

    .odds-box {
        position: relative;
        height: 36px;
        width: 80px;
        border-radius: 4px;
        padding: 0;
        background-color: var();
    }

    .odds-box .form-control {
        height: 36px;
        width: 80px;
        background: #eee;
        color: #222;
        border: 0;
    }

    input.form-control:disabled {
        cursor: not-allowed;
    }



    .input-stake {
        background-color: transparent;
        width: 80px;
        height: 40px;
    }

    .casino-place-bet-button-container {
        display: flex;
        display: -webkit-flex;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 6px;
    }

    .casino-place-bet-button-container .btn {
        margin-right: 1%;
        margin-bottom: 1%;
        width: 32.6%;
        padding: 0;
    }

    .casino-place-bet-button-container .btn:nth-child(3n) {
        margin-right: 0;
    }

    .casino-place-bet-action-buttons {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 10px;
    }

    .casino-place-bet-action-buttons .btn {
        height: 40px;
        width: 112px;
    }

    .casino-min-max {
        font-size: var(--font-small);
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/responsive.css */
    @media only screen and (min-width: 320px) and (max-width: 1279px) {
        .casino-place-bet-box {
            padding: 0 6px;
            color: #000;
        }

        .casino-place-bet-title {
            padding: 16px 10px;
        }

        .casino-place-bet-info {
            display: block;
        }

        .bet-player {
            margin-bottom: 16px;
            color: var(--text-white);
        }

        .casino-place-bet-button-container .btn {
            width: 31.6%;
            margin-right: 2%;
            color: var(--text-highlight) !important;
        }

        .casino-place-bet {
            width: 100%;
        }

        .casino-place-bet-action-buttons .btn {
            width: 100%;
        }

        .casino-min-max {
            font-size: 11px;
        }

        .form-control {
            height: 32px;
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .form-control {
            font-size: var(--font-13);
        }
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {

        .casino-place-bet-info .bet-input,
        .input-stake {
            width: 140px;
        }

        .bet-input {
            margin: 0;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/custom.css */
    @media screen and (max-width: 767px) {
        .casino-place-bet-info img {
            height: 50px;
        }
    }

.casino-place-bet-box.back:hover {
    background-color: var(--back);
}

              .btn-reset {
        background-color: var(--btn-reset);
        border-color: var(--btn-reset);
    }

    .btn-reset:hover,
    .btn-reset:focus,
    .btn-reset:active {
        box-shadow: none;
        background-color: var(--btn-reset);
        border-color: var(--btn-reset);
        color: var(--text-white);
    }

    .casino-place-bet-box.lay:hover {
    background-color: var(--lay);
}
            .odds-box .arrow-up {
        position: absolute;
        top: 9px;
        right: 8px;
        transform: scaleY(-1);
    }

    .odds-box .arrow-down {
        position: absolute;
        bottom: 9px;
        right: 8px;
    }

            .odds-box .form-control {
    height: 36px;
    width: 80px;
    background: #eee;
    color: #222;
    border: 0;
}


              .casino-place-bet-header {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        padding: 8px;
        background-color: var(--bg-table-header-new);
        color: var(--text-table-header-new);
    }
            .btn-primary{
                margin-left:0px;
                }
            .bet-input {
    padding: 0px;
}
   .bet-team {
        font-size: var(--font-caption);
        margin-top: 0;
        font-weight: var(--font-bold);
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        align-items: center;
    }

    .bet-team-name {
        max-width: calc(100% - 85px);
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .bet-input {
        margin-top: 3px;
        margin-left: 4px;
        width: 120px;
        display: inline-block;
        vertical-align: top;
        position: relative;
        z-index: 0;
        overflow: hidden;
        height: 36px;
        margin: 0;
        margin-left: 0;
    }

    .bet-input.back-border {
        border-left: 0;
    }

    .bet-input .form-control {
        color: #222;
        height: 36px;
        border: 0;
        background-color: #eee;
    }

    .casino-place-bet-box {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        padding: 6px 6px;
        color: #000;
        flex-wrap: wrap;
    }

    .casino-place-bet-box.back:hover {
        background-color: var(--back);
    }

    .casino-place-bet-info {
        display: flex;
        display: -webkit-flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }

    .casino-place-bet-info .bet-input {
        width: 80px;
    }

    input.form-control:disabled {
        cursor: not-allowed;
    }

    .input-stake {
        background-color: transparent;
        width: 80px;
        height: 40px;
    }

    .casino-place-bet-button-container {
        display: flex;
        display: -webkit-flex;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 6px;
    }

    .casino-place-bet-button-container .btn {
        margin-right: 1%;
        margin-bottom: 1%;
        width: 32.6%;
        padding: 0;
    }

    .casino-place-bet-button-container .btn:nth-child(3n) {
        margin-right: 0;
    }

    .casino-place-bet-action-buttons {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 10px;
    }

    .casino-place-bet-action-buttons .btn {
        height: 40px;
        width: 112px;
    }

    .casino-min-max {
        font-size: var(--font-small);
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/responsive.css */
    @media only screen and (min-width: 320px) and (max-width: 1279px) {
        .modal-body {
            padding: 8px 6px;
        }

        .casino-place-bet-box {
            padding: 0 6px;
            color: #000;
        }

        .bet-slip {
            width: 100%;
        }

        .casino-place-bet-info {
            display: block;
        }

        .casino-place-bet-button-container .btn {
            width: 31.6%;
            margin-right: 2%;
            color: var(--text-highlight) !important;
        }

        .casino-place-bet-action-buttons .btn {
            width: 100%;
        }

        .casino-min-max {
            font-size: 11px;
        }

        .modal-content {
            max-height: calc(100vh - 108px);
        }

        .modal-header {
            padding: 8px;
        }

        .modal-title {
            font-size: var(--font-caption);
        }

        .modal-title .casino-min-max {
            color: var(--text-highlight);
        }

        .modal-body {
            max-height: calc(100vh - 40px);
        }

        .form-control {
            height: 32px;
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1365px) {
        .bet-slip {
            padding: 8px;
        }
    }

    @media only screen and (min-width: 1366px) and (max-width: 1599px) {
        .bet-slip {
            padding: 8px;
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .form-control {
            font-size: var(--font-13);
        }

        .bet-team {
            font-size: var(--font-13);
        }

        .modal-header {
            padding: 2px 8px;
        }

        .modal-title {
            font-size: var(--font-body);
        }
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {
        .modal-body {
            max-height: calc(100vh - 146px);
        }

        .place-modal .modal-body {
            padding: 0;
        }

        .casino-place-bet-info .bet-input,
        .casino-place-bet-info .form-control.input-stake {
            width: 140px !important;
        }

        input.input-stake[type="number"] {
            -moz-appearance: textfield;
        }

        .bet-input {
            margin: 0;
        }
    }
        `}</style>
        </>
    )
}

export function KbcBetPopupCss() {
    return (
        <>
            <style>{`

    /*! CSS Used from: https://use.fontawesome.com/releases/v5.7.0/css/all.css */
    .fas {
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        display: inline-block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        line-height: 1;
    }

    .fa-times:before {
        content: "\f00d";
    }

    .fas {
        font-family: "Font Awesome 5 Free";
    }

    .fas {
        font-weight: 900;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
    }

    button {
        border-radius: 0;
    }

    button:focus {
        outline: 1px dotted;
        outline: 5px auto -webkit-focus-ring-color;
    }

    button,
    input {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    button,
    input {
        overflow: visible;
    }

    button {
        text-transform: none;
    }

    button {
        -webkit-appearance: button;
    }

    button:not(:disabled) {
        cursor: pointer;
    }

    .form-control {
        display: block;
        width: 100%;
        height: calc(1.5em + .75rem + 2px);
        padding: .375rem .75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .form-control {
            transition: none;
        }
    }

    `}</style>
            <style>{`


    .form-control:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .form-control::placeholder {
        color: #6c757d;
        opacity: 1;
    }

    .form-control:disabled {
        background-color: #e9ecef;
        opacity: 1;
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        color: #212529;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: transparent;
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .btn {
            transition: none;
        }
    }

    .btn:hover {
        color: #212529;
        text-decoration: none;
    }

    .btn:focus {
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .btn:disabled {
        opacity: .65;
    }

    .btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
    }
    `}</style>
            <style>{`
    .btn-primary:focus {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-primary:disabled {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:not(:disabled):not(.disabled):active {
        color: #fff;
        background-color: #0062cc;
        border-color: #005cbf;
    }

    .btn-primary:not(:disabled):not(.disabled):active:focus {
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-link {
        font-weight: 400;
        color: #007bff;
        text-decoration: none;
    }

    .btn-link:hover {
        color: #0056b3;
        text-decoration: underline;
    }

    .btn-link:focus {
        text-decoration: underline;
        box-shadow: none;
    }

    .btn-link:disabled {
        color: #6c757d;
        pointer-events: none;
    }

    .btn-sm {
        padding: .25rem .5rem;
        font-size: .875rem;
        line-height: 1.5;
        border-radius: .2rem;
    }

    .modal-body {
        position: relative;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        padding: 1rem;
    }

    .flex-fill {
        -ms-flex: 1 1 auto !important;
        flex: 1 1 auto !important;
    }

    .float-right {
        float: right !important;
    }

    .w-100 {
        width: 100% !important;
    }

    .w-auto {
        width: auto !important;
    }

    .mt-1 {
        margin-top: .25rem !important;
    }

    .mt-2 {
        margin-top: .5rem !important;
    }

    .text-right {
        text-align: right !important;
    }

    .text-dark {
        color: #343a40 !important;
    }

    @media print {

        *,
        ::after,
        ::before {
            text-shadow: none !important;
            box-shadow: none !important;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/control.css */
    .form-control {
        background-color: #444;
        height: 36px;
        border-radius: 0;
        border: 1px solid #555;
        color: #ddd;
    }

    .form-control::placeholder {
        color: inherit;
        opacity: 1;
    }

    .form-control:focus,
    .form-control:hover {
        box-shadow: 0 0 4px var(--text-body);
        background-color: var(--bg-body);
        border: 1px solid var(--text-body);
        color: var(--text-body);
        box-shadow: none;
    }

    .btn {
        box-shadow: none !important;
        height: auto;
        color: var(--text-white);
        border-radius: 0;
    }

    .btn-primary {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:hover,
    .btn-primary:focus,
    .btn-primary:active,
    .btn-primary:not(:disabled):not(.disabled):active {
        box-shadow: none;
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:disabled {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
        cursor: not-allowed;
    }

    .btn-reset {
        background-color: var(--btn-reset);
        border-color: var(--btn-reset);
    }

    .btn-reset:hover,
    .btn-reset:focus,
    .btn-reset:active {
        box-shadow: none;
        background-color: var(--btn-reset);
        border-color: var(--btn-reset);
        color: var(--text-white);
    }
    `}</style>
            <style>{`
    .btn-bet {
        height: 34px;
        background-color: var(--btn-primary);
        border-color: transparent;
        color: var(--text-white);
    }

    .btn-bet:hover,
    .btn-bet:focus,
    .btn-bet:active {
        background-color: var(--btn-primary) !important;
        border-color: transparent !important;
        color: var(--text-white) !important;
    }

    .modal-body {
        padding: 8px;
        max-height: calc(100vh - 60px);
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #666 #222;
    }

    .modal-body::-webkit-scrollbar {
        width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
        background: #666;
    }

    .modal-body::-webkit-scrollbar-thumb {
        background-color: #222;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/style.css */
    * {
        outline: 0 !important;
    }
    `}</style>
            <style>{`
    button,
    input {
        font-family: revert;
    }

    .back {
        background-color: var(--back);
    }

    .back:hover {
        background-color: var(--back-hover);
    }

    .back-border {
        border-left: 5px solid var(--back);
    }

    .bet-input {
        margin-top: 3px;
        margin-left: 4px;
        width: 120px;
        display: inline-block;
        vertical-align: top;
        position: relative;
        z-index: 0;
        overflow: hidden;
        height: 36px;
        margin: 0;
        margin-left: 0;
    }

    .bet-input.back-border {
        border-left: 0;
    }

    .bet-input .form-control {
        color: #222;
        height: 36px;
        border: 0;
        background-color: #eee;
    }

    .casino-place-bet-box {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        padding: 6px 6px;
        color: #000;
        flex-wrap: wrap;
    }

    .casino-place-bet-box.back:hover {
        background-color: var(--back);
    }

    input.form-control:disabled {
        cursor: not-allowed;
    }
    `}</style>
            <style>{`
    .input-stake {
        background-color: transparent;
        width: 80px;
        height: 40px;
    }

    .casino-place-bet-button-container {
        display: flex;
        display: -webkit-flex;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 6px;
    }

    .casino-place-bet-button-container .btn {
        margin-right: 1%;
        margin-bottom: 1%;
        width: 32.6%;
        padding: 0;
    }

    .casino-place-bet-button-container .btn:nth-child(3n) {
        margin-right: 0;
    }

    .casino-place-bet-action-buttons {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 10px;
    }

    .casino-place-bet-action-buttons .btn {
        height: 40px;
        width: 112px;
    }

    .kbcbtesbox {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        width: 100%;
    }

    .kbcbtesbox .bet-box {
        background: #444;
        padding: 5px 10px;
        border-radius: 0;
        margin-left: 3px;
        margin-right: 3px;
        width: calc(33.33% - 6px);
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 32px;
        color: #ddd;
    }

    .kbcbtesbox .bet-box span {
        flex: 1;
        text-align: center;
    }

    .kbcbtesbox .bet-box i {
        color: var(--text-red);
        cursor: pointer;
    }

    .kbcbtesbox .bet-input {
        width: calc(33.33% - 6px);
        margin-bottom: 5px;
        height: 32px;
    }

    .kbcbtesbox .bet-input input {
        height: 32px;
    }

    .kbcbtesbox>div {
        width: calc(33.33% - 6px);
        margin-bottom: 5px;
    }

    .hfquitbtns {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .casino-place-bet-box .hfquitbtns .hbtn {
        background-image: linear-gradient(-180deg, #03b37f 0%, #06553e 100%);
        border-color: #116f52 !important;
        border-width: 5px !important;
        border-top: 5px solid #131399;
        margin-right: 20px;
    }

    .casino-place-bet-box .hfquitbtns .fbtn {
        background-image: linear-gradient(-180deg, #fc4242 0%, #6f0404 100%);
        border-color: #6f0404 !important;
        border-width: 5px !important;
        border-top: 5px solid #6f0404;
    }
    `}</style>
            <style>{`
    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/responsive.css */
    @media only screen and (min-width: 320px) and (max-width: 1279px) {
        .modal-body {
            padding: 8px 6px;
        }

        .casino-place-bet-box {
            padding: 0 6px;
            color: #000;
        }

        .casino-place-bet-button-container .btn {
            width: 31.6%;
            margin-right: 2%;
            color: var(--text-highlight);
        }

        .casino-place-bet-action-buttons .btn {
            width: 100%;
        }

        .modal-body {
            max-height: calc(100vh - 40px);
        }

        .form-control {
            height: 32px;
        }

        .casino-place-bet-box .hfquitbtns .fbtn {
            border-width: 2px !important;
            border-top: 2px solid #6f0404;
        }

        .casino-place-bet-box .hfquitbtns .hbtn {
            border-width: 2px !important;
            border-color: 2px solid #131399;
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .form-control {
            font-size: var(--font-13);
        }
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {
        .modal-body {
            max-height: calc(100vh - 146px);
        }

        .place-modal .modal-body {
            padding: 0;
        }

        .input-stake {
            width: 140px;
        }

        .bet-input {
            margin: 0;
        }
    }

    /*! CSS Used fontfaces */
    @font-face {
        font-family: "Font Awesome 5 Free";
        font-style: normal;
        font-weight: 400;
        font-display: auto;
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.eot);
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.eot?#iefix) format("embedded-opentype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.woff2) format("woff2"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.woff) format("woff"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.ttf) format("truetype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.svg#fontawesome) format("svg");
    }

    @font-face {
        font-family: "Font Awesome 5 Free";
        font-style: normal;
        font-weight: 900;
        font-display: auto;
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.eot);
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.eot?#iefix) format("embedded-opentype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.woff2) format("woff2"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.woff) format("woff"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.ttf) format("truetype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.svg#fontawesome) format("svg");
    }


    `}</style>
            <style>{`

    /*! CSS Used from: https://use.fontawesome.com/releases/v5.7.0/css/all.css */
    .fas {
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        display: inline-block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        line-height: 1;
    }

    .fa-times:before {
        content: "\f00d";
    }

    .fas {
        font-family: "Font Awesome 5 Free";
    }

    .fas {
        font-weight: 900;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
    }

    button {
        border-radius: 0;
    }

    button:focus {
        outline: 1px dotted;
        outline: 5px auto -webkit-focus-ring-color;
    }

    button,
    input {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    button,
    input {
        overflow: visible;
    }

    button {
        text-transform: none;
    }

    button {
        -webkit-appearance: button;
    }

    button:not(:disabled) {
        cursor: pointer;
    }

    .form-control {
        display: block;
        width: 100%;
        height: calc(1.5em + .75rem + 2px);
        padding: .375rem .75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .form-control {
            transition: none;
        }
    }

    .form-control:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .form-control::placeholder {
        color: #6c757d;
        opacity: 1;
    }

    .form-control:disabled {
        background-color: #e9ecef;
        opacity: 1;
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        color: #212529;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: transparent;
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .btn {
            transition: none;
        }
    }

    .btn:hover {
        color: #212529;
        text-decoration: none;
    }

    .btn:focus {
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .btn:disabled {
        opacity: .65;
    }

    .btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
    }

    .btn-primary:focus {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-primary:disabled {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:not(:disabled):not(.disabled):active {
        color: #fff;
        background-color: #0062cc;
        border-color: #005cbf;
    }

    .btn-primary:not(:disabled):not(.disabled):active:focus {
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-link {
        font-weight: 400;
        color: #007bff;
        text-decoration: none;
    }

    .btn-link:hover {
        color: #0056b3;
        text-decoration: underline;
    }

    .btn-link:focus {
        text-decoration: underline;
        box-shadow: none;
    }

    .btn-link:disabled {
        color: #6c757d;
        pointer-events: none;
    }

    .btn-sm {
        padding: .25rem .5rem;
        font-size: .875rem;
        line-height: 1.5;
        border-radius: .2rem;
    }
    `}</style>

            <style>{`
    .flex-fill {
        -ms-flex: 1 1 auto !important;
        flex: 1 1 auto !important;
    }

    .float-right {
        float: right !important;
    }

    .w-auto {
        width: auto !important;
    }

    .text-right {
        text-align: right !important;
    }

    .text-dark {
        color: #343a40 !important;
    }

    @media print {

        *,
        ::after,
        ::before {
            text-shadow: none !important;
            box-shadow: none !important;
        }
    }
    `}</style>
            <style>{`
    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/control.css */
    .form-control {
        background-color: #444;
        height: 36px;
        border-radius: 0;
        border: 1px solid #555;
        color: #ddd;
    }

    .form-control::placeholder {
        color: inherit;
        opacity: 1;
    }

    .form-control:focus,
    .form-control:hover {
        box-shadow: 0 0 4px var(--text-body);
        background-color: var(--bg-body);
        border: 1px solid var(--text-body);
        color: var(--text-body);
        box-shadow: none;
    }

    .btn {
        box-shadow: none !important;
        height: auto;
        color: var(--text-white);
        border-radius: 0;
    }

    .btn-primary {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:hover,
    .btn-primary:focus,
    .btn-primary:active,
    .btn-primary:not(:disabled):not(.disabled):active {
        box-shadow: none;
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }
    `}</style>
            <style>{`
    .btn-primary:disabled {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
        cursor: not-allowed;
    }

    .btn-reset {
        background-color: var(--btn-reset);
        border-color: var(--btn-reset);
    }

    .btn-reset:hover,
    .btn-reset:focus,
    .btn-reset:active {
        box-shadow: none;
        background-color: var(--btn-reset);
        border-color: var(--btn-reset);
        color: var(--text-white);
    }

    .btn-bet {
        height: 34px;
        background-color: var(--btn-primary);
        border-color: transparent;
        color: var(--text-white);
    }

    .btn-bet:hover,
    .btn-bet:focus,
    .btn-bet:active {
        background-color: var(--btn-primary) !important;
        border-color: transparent !important;
        color: var(--text-white) !important;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/style.css */
    * {
        outline: 0 !important;
    }

    button,
    input {
        font-family: revert;
    }

    .back-border {
        border-left: 5px solid var(--back);
    }

    .bet-input {
        margin-top: 3px;
        margin-left: 4px;
        width: 120px;
        display: inline-block;
        vertical-align: top;
        position: relative;
        z-index: 0;
        overflow: hidden;
        height: 36px;
        margin: 0;
        margin-left: 0;
    }

    .bet-input.back-border {
        border-left: 0;
    }

    .bet-input .form-control {
        color: #222;
        height: 36px;
        border: 0;
        background-color: #eee;
    }

    .casino-place-bet-box {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        padding: 6px 6px;
        color: #000;
        flex-wrap: wrap;
    }

    input.form-control:disabled {
        cursor: not-allowed;
    }

    .input-stake {
        background-color: transparent;
        width: 80px;
        height: 40px;
    }

    .casino-place-bet-button-container {
        display: flex;
        display: -webkit-flex;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 6px;
    }

    .casino-place-bet-button-container .btn {
        margin-right: 1%;
        margin-bottom: 1%;
        width: 32.6%;
        padding: 0;
    }

    .casino-place-bet-button-container .btn:nth-child(3n) {
        margin-right: 0;
    }

    .casino-place-bet-action-buttons {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 10px;
    }

    .casino-place-bet-action-buttons .btn {
        height: 40px;
        width: 112px;
    }

    .kbcbtesbox {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        width: 100%;
    }

    .kbcbtesbox .bet-box {
        background: #444;
        padding: 5px 10px;
        border-radius: 0;
        margin-left: 3px;
        margin-right: 3px;
        width: calc(33.33% - 6px);
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 32px;
        color: #ddd;
    }

    .kbcbtesbox .bet-box span {
        flex: 1;
        text-align: center;
    }

    .kbcbtesbox .bet-box i {
        color: var(--text-red);
        cursor: pointer;
    }

    .kbcbtesbox .bet-input {
        width: calc(33.33% - 6px);
        margin-bottom: 5px;
        height: 32px;
    }

    .kbcbtesbox .bet-input input {
        height: 32px;
    }

    .kbcbtesbox>div {
        width: calc(33.33% - 6px);
        margin-bottom: 5px;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/responsive.css */
    @media only screen and (min-width: 320px) and (max-width: 1279px) {
        .casino-place-bet-box {
            padding: 0 6px;
            color: #000;
        }

        .casino-place-bet-button-container .btn {
            width: 31.6%;
            margin-right: 2%;
            color: var(--text-highlight);
        }

        .casino-place-bet-action-buttons .btn {
            width: 100%;
        }

        .form-control {
            height: 32px;
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .form-control {
            font-size: var(--font-13);
        }
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {
        .input-stake {
            width: 140px;
        }

        .bet-input {
            margin: 0;
        }
    }

    /*! CSS Used fontfaces */
    @font-face {
        font-family: "Font Awesome 5 Free";
        font-style: normal;
        font-weight: 400;
        font-display: auto;
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.eot);
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.eot?#iefix) format("embedded-opentype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.woff2) format("woff2"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.woff) format("woff"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.ttf) format("truetype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.svg#fontawesome) format("svg");
    }

    @font-face {
        font-family: "Font Awesome 5 Free";
        font-style: normal;
        font-weight: 900;
        font-display: auto;
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.eot);
        src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.eot?#iefix) format("embedded-opentype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.woff2) format("woff2"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.woff) format("woff"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.ttf) format("truetype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.svg#fontawesome) format("svg");
    }

`}</style>
            <style>{`
            /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/bootstrap.min.css */
*,::after,::before{box-sizing:border-box;}
header{display:block;}
h5{margin-top:0;margin-bottom:.5rem;}
h5{margin-bottom:.5rem;font-weight:500;line-height:1.2;}
h5{font-size:1.25rem;}
.modal-header{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:justify;justify-content:space-between;padding:1rem 1rem;border-bottom:1px solid #dee2e6;border-top-left-radius:calc(.3rem - 1px);border-top-right-radius:calc(.3rem - 1px);}
.modal-title{margin-bottom:0;line-height:1.5;}
.ml-2{margin-left:.5rem!important;}
@media print{
*,::after,::before{text-shadow:none!important;box-shadow:none!important;}
}
/*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/control.css */
.modal-header{border:0;border-radius:0;background-color:var(--bg-table-header-new);color:var(--text-table-header-new);padding:8px;}
.modal-title{color:var(--text-fancy);font-size:var(--font-18);}
/*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/style.css */
*{outline:0!important;}
.casino-min-max{font-size:var(--font-small);}
/*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/responsive.css */
@media only screen and (min-width: 320px) and (max-width: 1279px){
.casino-min-max{font-size:11px;}
.modal-header{padding:8px;}
.modal-title{font-size:var(--font-caption);}
.modal-title .casino-min-max{color:var(--text-highlight);}
}
@media only screen and (min-width: 1280px) and (max-width: 1599px){
.modal-header{padding:2px 8px;}
.modal-title{font-size:var(--font-body);}
}

@media only screen and (min-width: 320px) and (max-width: 1279px) {
    .hfquitbtns .fbtn.selected, .hfquitbtns .hbtn.selected {
        border-color: var(--text-fancy) !important;
        box-shadow: 0 0 10px #fff !important;
    }
}
`}</style>
        </>
    )
}


export function LoginCss() {
    return (
        <style>{`
    /*! CSS Used from: https://use.fontawesome.com/releases/v5.7.0/css/all.css */
    .fa {
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        display: inline-block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        line-height: 1;
    }

    .fa-eye:before {
        content: "\f06e";
    }

    .fa {
        font-family: "Font Awesome 5 Free";
    }

    .fa {
        font-weight: 900;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/bootstrap.min.css */
    *,
    ::after,
    ::before {
        box-sizing: border-box;
    }

    header {
        display: block;
    }

    [tabindex="-1"]:focus:not(:focus-visible) {
        outline: 0 !important;
    }

    h5 {
        margin-top: 0;
        margin-bottom: .5rem;
    }

    small {
        font-size: 80%;
    }

    a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
    }

    a:hover {
        color: #0056b3;
        text-decoration: underline;
    }

    img {
        vertical-align: middle;
        border-style: none;
    }

    label {
        display: inline-block;
        margin-bottom: .5rem;
    }

    button {
        border-radius: 0;
    }

    button:focus {
        outline: 1px dotted;
        outline: 5px auto -webkit-focus-ring-color;
    }

    button,
    input {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    button,
    input {
        overflow: visible;
    }

    button {
        text-transform: none;
    }

    [type=button],
    [type=submit],
    button {
        -webkit-appearance: button;
    }

    [type=button]:not(:disabled),
    [type=submit]:not(:disabled),
    button:not(:disabled) {
        cursor: pointer;
    }

    input[type=checkbox] {
        box-sizing: border-box;
        padding: 0;
    }

    h5 {
        margin-bottom: .5rem;
        font-weight: 500;
        line-height: 1.2;
    }

    h5 {
        font-size: 1.25rem;
    }

    small {
        font-size: 80%;
        font-weight: 400;
    }

    .form-control {
        display: block;
        width: 100%;
        height: calc(1.5em + .75rem + 2px);
        padding: .375rem .75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .form-control {
            transition: none;
        }
    }

    .form-control:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .form-control::placeholder {
        color: #6c757d;
        opacity: 1;
    }

    .form-control:disabled {
        background-color: #e9ecef;
        opacity: 1;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        color: #212529;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: transparent;
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .btn {
            transition: none;
        }
    }

    .btn:hover {
        color: #212529;
        text-decoration: none;
    }

    .btn:focus {
        outline: 0;
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .btn:disabled {
        opacity: .65;
    }

    .btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
    }

    .btn-primary:focus {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-primary:disabled {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn-primary:not(:disabled):not(.disabled):active {
        color: #fff;
        background-color: #0062cc;
        border-color: #005cbf;
    }

    .btn-primary:not(:disabled):not(.disabled):active:focus {
        box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);
    }

    .btn-secondary {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
    }

    .btn-secondary:hover {
        color: #fff;
        background-color: #5a6268;
        border-color: #545b62;
    }

    .btn-secondary:focus {
        color: #fff;
        background-color: #5a6268;
        border-color: #545b62;
        box-shadow: 0 0 0 .2rem rgba(130, 138, 145, .5);
    }

    .btn-secondary:disabled {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
    }

    .btn-secondary:not(:disabled):not(.disabled):active {
        color: #fff;
        background-color: #545b62;
        border-color: #4e555b;
    }

    .btn-secondary:not(:disabled):not(.disabled):active:focus {
        box-shadow: 0 0 0 .2rem rgba(130, 138, 145, .5);
    }

    .btn-block {
        display: block;
        width: 100%;
    }

    .input-group {
        position: relative;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        -ms-flex-align: stretch;
        align-items: stretch;
        width: 100%;
    }

    .input-group>.form-control {
        position: relative;
        -ms-flex: 1 1 0%;
        flex: 1 1 0%;
        min-width: 0;
        margin-bottom: 0;
    }

    .input-group>.form-control:focus {
        z-index: 3;
    }

    .input-group>.form-control:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .input-group-append {
        display: -ms-flexbox;
        display: flex;
    }

    .input-group-append .btn {
        position: relative;
        z-index: 2;
    }

    .input-group-append .btn:focus {
        z-index: 3;
    }

    .input-group-append {
        margin-left: -1px;
    }

    .input-group>.input-group-append>.btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .custom-control {
        position: relative;
        display: block;
        min-height: 1.5rem;
        padding-left: 1.5rem;
    }

    .custom-control-input {
        position: absolute;
        left: 0;
        z-index: -1;
        width: 1rem;
        height: 1.25rem;
        opacity: 0;
    }

    .custom-control-input:checked~.custom-control-label::before {
        color: #fff;
        border-color: #007bff;
        background-color: #007bff;
    }

    .custom-control-input:focus~.custom-control-label::before {
        box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
    }

    .custom-control-input:focus:not(:checked)~.custom-control-label::before {
        border-color: #80bdff;
    }

    .custom-control-input:not(:disabled):active~.custom-control-label::before {
        color: #fff;
        background-color: #b3d7ff;
        border-color: #b3d7ff;
    }

    .custom-control-input:disabled~.custom-control-label {
        color: #6c757d;
    }

    .custom-control-input:disabled~.custom-control-label::before {
        background-color: #e9ecef;
    }

    .custom-control-label {
        position: relative;
        margin-bottom: 0;
        vertical-align: top;
    }

    .custom-control-label::before {
        position: absolute;
        top: .25rem;
        left: -1.5rem;
        display: block;
        width: 1rem;
        height: 1rem;
        pointer-events: none;
        content: "";
        background-color: #fff;
        border: #adb5bd solid 1px;
    }

    .custom-control-label::after {
        position: absolute;
        top: .25rem;
        left: -1.5rem;
        display: block;
        width: 1rem;
        height: 1rem;
        content: "";
        background: no-repeat 50%/50% 50%;
    }

    .custom-checkbox .custom-control-label::before {
        border-radius: .25rem;
    }

    .custom-checkbox .custom-control-input:checked~.custom-control-label::after {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/%3e%3c/svg%3e");
    }

    .custom-checkbox .custom-control-input:disabled:checked~.custom-control-label::before {
        background-color: rgba(0, 123, 255, .5);
    }

    .custom-control-label::before {
        transition: background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    @media (prefers-reduced-motion:reduce) {
        .custom-control-label::before {
            transition: none;
        }
    }

    .modal-content {
        position: relative;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        width: 100%;
        pointer-events: auto;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, .2);
        border-radius: .3rem;
        outline: 0;
    }

    .modal-header {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-align: start;
        align-items: flex-start;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 1rem 1rem;
        border-bottom: 1px solid #dee2e6;
        border-top-left-radius: calc(.3rem - 1px);
        border-top-right-radius: calc(.3rem - 1px);
    }

    .modal-body {
        position: relative;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        padding: 1rem;
    }

    .d-inline-block {
        display: inline-block !important;
    }

    .mt-0 {
        margin-top: 0 !important;
    }

    .mb-1 {
        margin-bottom: .25rem !important;
    }

    .text-danger {
        color: #dc3545 !important;
    }

    a.text-danger:focus,
    a.text-danger:hover {
        color: #a71d2a !important;
    }

    @media print {

        *,
        ::after,
        ::before {
            text-shadow: none !important;
            box-shadow: none !important;
        }

        a:not(.btn) {
            text-decoration: underline;
        }

        img {
            page-break-inside: avoid;
        }
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/control.css */
    .text-danger {
        color: var(--book-red) !important;
    }

    .form-group {
        margin-right: 16px;
    }

    .form-control {
        background-color: #444;
        height: 36px;
        border-radius: 0;
        border: 1px solid #555;
        color: #ddd;
    }

    .form-control::placeholder {
        color: inherit;
        opacity: 1;
    }

    .form-control:focus,
    .form-control:hover {
        box-shadow: 0 0 4px var(--text-body);
        background-color: var(--bg-body);
        border: 1px solid var(--text-body);
        color: var(--text-body);
        box-shadow: none;
    }

    label {
        font-size: var(--font-small);
        color: var(--text-body);
        margin-bottom: 8px;
    }

    .btn {
        box-shadow: none !important;
        height: auto;
        color: var(--text-white);
        border-radius: 0;
    }

    .btn-primary {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:hover,
    .btn-primary:focus,
    .btn-primary:active,
    .btn-primary:not(:disabled):not(.disabled):active {
        box-shadow: none;
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
    }

    .btn-primary:disabled {
        background-color: var(--btn-primary);
        border-color: var(--btn-primary);
        cursor: not-allowed;
    }

    .modal-content {
        background-color: var(--bg-table);
        color: var(--text-table);
        border-radius: 0;
        border: 0;
        max-height: calc(100vh - 50px);
    }

    .modal-header {
        border: 0;
        border-radius: 0;
        background-color: var(--bg-table-header-new);
        color: var(--text-table-header-new);
        padding: 8px;
    }

    .modal-body {
        padding: 8px;
        max-height: calc(100vh - 60px);
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #666 #222;
    }

    .modal-body::-webkit-scrollbar {
        width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
        background: #666;
    }

    .modal-body::-webkit-scrollbar-thumb {
        background-color: #222;
    }

    .custom-control-label {
        color: var(--text-body);
        line-height: unset;
    }

    .custom-control-label::before {
        background-color: #222;
    }

    .custom-control-input:checked~.custom-control-label::before {
        border-color: #222;
        background-color: #222;
        background-image: fill;
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/style.css */
    * {
        outline: 0 !important;
    }

    button,
    input {
        font-family: revert;
    }

    a,
    a:hover,
    a:focus {
        text-decoration: none;
    }

    input.form-control:disabled {
        cursor: not-allowed;
    }

    .login-form {
        padding-top: 0;
        width: 100%;
        max-width: 400px;
        min-height: 320px;
    }

    .modal .login-form {
        max-width: 100%;
    }

    .login-form .form-group {
        margin-right: 0;
        margin-bottom: 20px;
        position: relative;
    }

    .login-form .form-group a {
        color: var(--text-green);
        text-decoration: underline;
    }

    .user-email-text {
        font-size: var(--font-caption);
        height: 17px;
        line-height: 17px;
        color: var(--text-table);
    }

    .login-form .form-control {
        height: 46px;
        border: 1px solid var(--text-body);
        opacity: 0.6;
        border-radius: 0;
        background-color: var(--bg-body);
        color: var(--text-body);
    }

    .login-form .custom-control-label::before {
        background-color: var(--bg-body);
        border: var(--text-body) solid 1px;
        border-radius: 2px !important;
        opacity: 0.6;
    }

    .login-form .custom-control-label {
        color: var(--text-body);
        font-size: var(--font-caption);
        line-height: 19px;
    }

    .login-form .btn-primary {
        height: 46px;
        font-weight: var(--font-semi);
        text-align: center;
    }

    .modal-login-new .modal-content {
        border-radius: 0;
        background-color: #333;
        border-color: transparent;
        border-width: 1px;
    }

    .modal-login-new .modal-header {
        justify-content: flex-end;
        padding: 10px 16px;
        background: #000;
        border-radius: 0;
        color: #fff;
    }

    .close-login-modal {
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 100;
        cursor: pointer;
        width: 100%;
    }

    .close-login-modal h5 {
        margin-bottom: 0;
    }

    .close-login-modal img {
        height: 30px;
        width: 30px;
        border-radius: 50%;
        background: transparent;
        padding: 5px;
        border: 2px solid #f00;
    }

    .modal-login-new .modal-body {
        padding: 16px;
        max-height: 100vh;
    }

    .modal-login-new .modal-body .login-form {
        background: #000;
        color: #fff;
        padding: 16px;
        border-radius: 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .modal-login-new .modal-body label {
        color: #fff;
        font-size: 16px;
    }

    .modal-login-new .modal-body .custom-control label {
        font-size: 13px;
    }

    .modal-login-new .form-group {
        margin-right: 0;
        margin-bottom: 20px;
        width: 100%;
    }

    .modal-login-new .form-control {
        border: 1px solid #777;
        color: #fff;
        transition: 0.8s;
        height: 56px;
        background-color: #444;
    }

    .modal-login-new .btn-primary {
        height: 56px;
    }

    .modal-login-new .form-control:hover,
    .modal-login-new .form-control:focus {
        background-color: transparent;
    }

    .recaptchaTerms a {
        color: var(--text-green);
    }

    .custom-control-input:disabled~.custom-control-label {
        color: inherit;
    }

    .login-btn-devider {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 8px;
    }

    .login-btn-devider::after {
        position: absolute;
        content: "";
        background-color: var(--text-yellow);
        height: 1px;
        right: 0;
        width: calc(50% - 20px);
    }

    .login-btn-devider::before {
        position: absolute;
        content: "";
        background-color: var(--text-yellow);
        height: 1px;
        left: 0;
        width: calc(50% - 20px);
    }

    /*! CSS Used from: https://wver.sprintstaticdata.com/v198/static/front/css/responsive.css */
    @media only screen and (min-width: 320px) and (max-width: 1279px) {
        .modal-body {
            padding: 8px 6px;
        }

        .modal-content {
            max-height: calc(100vh - 108px);
        }

        .modal-header {
            padding: 8px;
        }

        .modal-body {
            max-height: calc(100vh - 40px);
        }

        label {
            margin-bottom: 4px;
            line-height: 16px;
        }

        .form-control {
            height: 32px;
        }
    }

    @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .form-control {
            font-size: var(--font-13);
        }

        .login-form .form-control,
        .login-form .btn-primary {
            height: 40px;
        }

        .login-form {
            min-height: 300px;
        }

        .modal-header {
            padding: 2px 8px;
        }
    }

    @media only screen and (min-width: 320px) and (max-width: 767px) {
        .login-form {
            min-height: unset;
        }

        .modal-body {
            max-height: calc(100vh - 146px);
        }

        .custom-control-label {
            line-height: unset;
        }

        .modal-login-new .modal-body label {
            font-size: 12px;
            margin-bottom: 0;
        }

        .recaptchaTerms {
            font-size: 100%;
        }

        .modal-login-new .modal-body {
            padding: 8px;
        }

        .modal-login-new .modal-content {
            max-height: calc(100vh - 0px);
        }

        .modal-login-new .form-group {
            margin-bottom: 10px;
        }

        .modal-login-new .form-group {
            margin-bottom: 15px;
        }

        .modal-login-new .form-control {
            height: 36px;
            font-size: 14px;
        }
    }

    .password-visible {
        min-width: 50px;
    }
        `}</style>
    )
}

export function EventBetPopUpStyle() {
    return (
        <style>{`
            
.row.row5 {
  margin-left: -5px;
  margin-right: -5px;
}

.row.row5>[class*="col-"],
.row.row5>[class*="col"] {
  padding-left: 5px;
  padding-right: 5px;
}

.bet-slip-container {
  margin-bottom: 8px;
}

.bet-slip-title {
  height: 22px;
  color: var(--text-sidebar);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  display: inline-block;
  font-size: var(--font-header);
}

.bet-slip-container .clear-all {
  height: 19px;
  color: var(--text-sidebar);
  font-size: var(--font-caption);
  line-height: 19px;
}

.bet-slip-box {
  border-radius: 0;
  margin-top: 4px;
  padding: 4px 0;
}

.bet-slip-box.back,
.bet-slip-box.lay {
  color: #000;
}

.bet-slip-box.back:hover,
.bet-slip-box.back:focus,
.bet-slip-box.back:active {
  background-color: var(--back);
}

.bet-slip-box.lay:hover,
.bet-slip-box.lay:focus,
.bet-slip-box.lay:active {
  background-color: var(--lay);
}

.bet-slip {
  border-bottom: 1px solid #666;
  padding: 0 4px;
  margin-bottom: 4px;
}

.bet-slip:last-child {
  border-bottom: 0;
}

.bet-nation span {
  height: auto;
  font-size: var(--font-caption);
  letter-spacing: 0;
  line-height: 1;
  max-width: calc(100% - 20px);
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: black;
}

.bet-team {
  font-size: var(--font-caption);
  margin-top: 4px;
  font-weight: var(--font-bold);
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
}

.bet-team-name {
  max-width: calc(100% - 85px);
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.bet-amount-box {
  display: flex;
  justify-content: space-between;
  padding: 0 4px 4px;
}

.bet-amount-box>div {
  display: flex;
  gap: 4px;
  padding-right: 4px;
  align-items: center;
}

.bet-input {
  width: 120px;
  display: inline-block;
  vertical-align: top;
  position: relative;
  z-index: 0;
  overflow: hidden;
  height: 36px;
  margin: 0;
  margin-left: 0;
}

.bet-input .form-control {
  color: #222;
  height: 36px;
  border: 0;
  background-color: #eee;
}

.bet-buttons {
  padding: 0 4px 0 4px;
  display: flex;
  display: -webkit-flex;
  justify-content: flex-center;
  flex-wrap: wrap;
}

.bet-buttons .btn-primary {
  min-width: calc(25% - 1.5px);
  margin-right: 2px;
  margin-bottom: 2px;
  height: 40px;
  border-radius: 0;
  background-color: var(--btn-primary);
  border-color: transparent;
  padding: 0;
}

.bet-buttons .btn:nth-child(4n) {
  margin-right: 0;
}

.bet-slip-container .place-bet-btn {
  padding: 2px 4px 0 4px;
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
}

.bet-slip-container .place-bet-btn .btn {
  height: auto;
  width: calc(50% - 2px);
}

.bet-slip-container .place-bet-btn .btn:first-child {
  margin-right: 2px;
}

.bet-slip-container .place-bet-btn .btn span {
  height: 22px;
  font-weight: var(--font-semi);
  text-align: center;
}


@media only screen and (min-width: 320px) and (max-width: 1599px) {
  .bet-slip-container .nav-tabs {
    padding-left: 10px;
    padding-right: 10px;
    max-width: 340px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media only screen and (min-width: 320px) and (max-width: 1279px) {
  .bet-slip-box .bet-time {
    display: inline-block;
    vertical-align: top;
  }
}

@media only screen and (min-width: 360px) and (max-width: 1024px) {
  .bet-slip-box {
    color: #000;
    margin-top: 0;
  }

  .bet-slip {
    width: 100%;
  }
}

@media only screen and (max-width: 767px) {
  .bet-slip-title {
    font-size: var(--font-caption);
  }

  .bet-slip-container .place-bet-btn .btn {
    height: 36px;
  }

  .bet-buttons .btn {
    font-size: var(--font-13);
  }

  .bet-input-box {
    align-items: center;
  }

  .bet-input {
    margin: 0;
  }
}
  .btn {
  }
            `}
        </style>
    )
}


export function Account_Statement() {
    return (
        <>

            <style>{`
            @media only screen and (min-width: 320px) and (max-width: 1279px) {
  .report-box {
    width: 100%;
    padding: 4px 0;
  }

  .report-title {
    padding: 4px 4px 0;
  }

  .report-name {
    font-size: var(--font-24);
    height: auto;
    line-height: normal;
  }

  .report-form {
    display: block;
    padding: 4px;
  }

  .report-form .form-group {
    display: block;
    margin-right: 0;
    margin-bottom: 8px;
  }

  .report-form select {
    width: 100%;
    font-size: var(--font-small);
  }

  .report-form .from-date,
  .report-form .to-date {
    width: 49.5%;
    float: left;
  }

  .report-form .from-date {
    margin-right: 1%;
  }

  .report-form .to-date {
    margin-right: 0;
  }

  .report-form input {
    width: 100%;
    font-size: var(--font-small);
    height: 32px;
  }

  .report-form button {
    width: 100%;
  }

  .report-table {
    margin-top: 0;
  }

  .report-row {
    padding: 16px 32px;
    border-bottom: 1px solid #666;
  }

  .report-row.back-border {
    border-left: 5px solid var(--back);
  }

  .report-row.lay-border {
    border-left: 5px solid var(--lay);
  }

  .report-row>div {
    margin-bottom: 2px;
  }

  .bet-heading {
    display: inline-block;
    min-width: 125px;
    color: var(--text-highlight);
    vertical-align: top;
  }

  .bet-heading+span {
    max-width: calc(100% - 130px);
    display: inline-block;
    vertical-align: top;
  }

  .bet-heading+span a {
    color: var(--text-table);
  }

  .report-page-count select {
    height: 32px;
    font-size: var(--font-small);
  }
}

        `}</style>

            <style>{`
            
        `}</style>

            <style>{`
            
        `}</style>
            <style>{`
            
        `}</style>
            <style>{`
            
        `}</style>
            <style>{`
            
        `}</style>
            <style>{`
            
        `}</style>
            <style>{`
            
        `}</style>

        </>
    )
}

export function AfterLoginImagePopupCss() {
    return (
        <style>{`
    /*! CSS Used from: https://use.fontawesome.com/releases/v5.7.0/css/all.css */
                .fas {
                    -moz - osx - font - smoothing: grayscale;
                -webkit-font-smoothing: antialiased;
                display: inline-block;
                font-style: normal;
                font-variant: normal;
                text-rendering: auto;
                line-height: 1;
    }

                .fa-times:before {
                    content: "\f00d";
    }

                .fas {
                    font - family: "Font Awesome 5 Free";
    }

                .fas {
                    font - weight: 900;
    }

                /*! CSS Used from: https://wver.sprintstaticdata.com/v206/static/front/css/bootstrap.min.css */
                *,
                ::after,
                ::before {
                    box - sizing: border-box;
    }

                header {
                    display: block;
    }

                [tabindex="-1"]:focus:not(:focus-visible) {
                    outline: 0 !important;
    }

                img {
                    vertical - align: middle;
                border-style: none;
    }

                .img-fluid {
                    max - width: 100%;
                height: auto;
    }

                .modal-content {
                    position: relative;
                display: -ms-flexbox;
                display: flex;
                -ms-flex-direction: column;
                flex-direction: column;
                width: 100%;
                pointer-events: auto;
                background-color: #fff;
                background-clip: padding-box;
                border: 1px solid rgba(0, 0, 0, .2);
                border-radius: .3rem;
                outline: 0;
    }

                .modal-header {
                    display: -ms-flexbox;
                display: flex;
                -ms-flex-align: start;
                align-items: flex-start;
                -ms-flex-pack: justify;
                justify-content: space-between;
                padding: 1rem 1rem;
                border-bottom: 1px solid #dee2e6;
                border-top-left-radius: calc(.3rem - 1px);
                border-top-right-radius: calc(.3rem - 1px);
    }

                .modal-body {
                    position: relative;
                -ms-flex: 1 1 auto;
                flex: 1 1 auto;
                padding: 1rem;
    }

                @media print {

        *,
        ::after,
                ::before {
                    text - shadow: none !important;
                box-shadow: none !important;
        }

                img {
                    page -break-inside: avoid;
        }
    }

                /*! CSS Used from: https://wver.sprintstaticdata.com/v206/static/front/css/control.css */
                .modal-content {
                    background - color: var(--bg-table);
                color: var(--text-table);
                border-radius: 0;
                border: 0;
                max-height: calc(100vh - 50px);
    }

                .modal-header {
                    border: 0;
                border-radius: 0;
                background-color: var(--bg-table-header-new);
                color: var(--text-table-header-new);
                padding: 8px;
    }

                .modal-body {
                    padding: 8px;
                max-height: calc(100vh - 60px);
                overflow-x: hidden;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #666 #222;
    }

                .modal-body::-webkit-scrollbar {
                    width: 8px;
    }

                .modal-body::-webkit-scrollbar-track {
                    background: #666;
    }

                .modal-body::-webkit-scrollbar-thumb {
                    background - color: #222;
    }

                /*! CSS Used from: https://wver.sprintstaticdata.com/v206/static/front/css/style.css */
                * {
                    outline: 0 !important;
    }

                .home-modal .modal-content {
                    background - color: transparent;
                max-height: calc(100vh - 78px);
    }

                .home-modal .modal-header {
                    padding: 0;
    }

                .home-modal .close-home-modal {
                    position: absolute;
                top: -10px;
                right: -20px;
                width: 40px;
                height: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 100;
                border-radius: 50%;
                background-color: red;
                color: var(--text-white);
                font-size: 24px;
                cursor: pointer;
    }

                .home-modal .modal-body {
                    padding: 0;
                background-color: transparent;
                box-shadow: 0px 0px 20px #a9a9a9;
    }

                .home-modal .modal-body img {
                    max - height: calc(100vh - 186px);
    }

                /*! CSS Used from: https://wver.sprintstaticdata.com/v206/static/front/css/responsive.css */
                @media only screen and (min-width: 320px) and (max-width: 1279px) {
        .modal - body {
                    padding: 8px 6px;
        }

                .modal-content {
                    max - height: calc(100vh - 108px);
        }

                .modal-header {
                    padding: 8px;
        }

                .modal-body {
                    max - height: calc(100vh - 40px);
        }
    }

                @media only screen and (min-width: 1280px) and (max-width: 1599px) {
        .modal - header {
                    padding: 2px 8px;
        }
    }

                @media only screen and (min-width: 320px) and (max-width: 767px) {
        .modal - body {
                    max - height: calc(100vh - 146px);
        }

                .home-modal .modal-content {
                    max - width: 300px;
                margin: 0 auto;
                max-height: 100vh;
        }

                .home-modal .modal-body {
                    max - height: calc(100vh - 30px);
        }

                .home-modal .close-home-modal {
                    top: -10px;
                right: -10px;
        }
    }

                /*! CSS Used fontfaces */
                @font-face {
                    font - family: "Font Awesome 5 Free";
                font-style: normal;
                font-weight: 400;
                font-display: auto;
                src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.eot);
                src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.eot?#iefix) format("embedded-opentype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.woff2) format("woff2"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.woff) format("woff"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.ttf) format("truetype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-regular-400.svg#fontawesome) format("svg");
    }

                @font-face {
                    font - family: "Font Awesome 5 Free";
                font-style: normal;
                font-weight: 900;
                font-display: auto;
                src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.eot);
                src: url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.eot?#iefix) format("embedded-opentype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.woff2) format("woff2"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.woff) format("woff"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.ttf) format("truetype"), url(https://use.fontawesome.com/releases/v5.7.0/webfonts/fa-solid-900.svg#fontawesome) format("svg");
    }
            `}</style>
    )
}

export function ResultBetTable() {
    return (
        <>
            <style>{`
            /*! CSS Used from: https://wver.sprintstaticdata.com/v208/static/front/css/bootstrap.min.css */
*,
::after,
::before {
    box-sizing: border-box;
}

table {
    border-collapse: collapse;
}

th {
    text-align: inherit;
}

label {
    display: inline-block;
    margin-bottom: .5rem;
}

input {
    margin: 0;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
}

input {
    overflow: visible;
}

input[type=checkbox],
input[type=radio] {
    box-sizing: border-box;
    padding: 0;
}

.table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
}

.table td,
.table th {
    padding: .75rem;
    vertical-align: top;
    border-top: 1px solid #dee2e6;
}

.table thead th {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
}

.table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.custom-control {
    position: relative;
    display: block;
    min-height: 1.5rem;
    padding-left: 1.5rem;
}

.custom-control-inline {
    display: -ms-inline-flexbox;
    display: inline-flex;
    margin-right: 1rem;
}

.custom-control-input {
    position: absolute;
    left: 0;
    z-index: -1;
    width: 1rem;
    height: 1.25rem;
    opacity: 0;
}

.custom-control-input:checked~.custom-control-label::before {
    color: #fff;
    border-color: #007bff;
    background-color: #007bff;
}

.custom-control-input:focus~.custom-control-label::before {
    box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
}

.custom-control-input:focus:not(:checked)~.custom-control-label::before {
    border-color: #80bdff;
}

.custom-control-input:not(:disabled):active~.custom-control-label::before {
    color: #fff;
    background-color: #b3d7ff;
    border-color: #b3d7ff;
}

.custom-control-input:disabled~.custom-control-label {
    color: #6c757d;
}

.custom-control-input:disabled~.custom-control-label::before {
    background-color: #e9ecef;
}

.custom-control-label {
    position: relative;
    margin-bottom: 0;
    vertical-align: top;
}

.custom-control-label::before {
    position: absolute;
    top: .25rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    content: "";
    background-color: #fff;
    border: #adb5bd solid 1px;
}

.custom-control-label::after {
    position: absolute;
    top: .25rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    content: "";
    background: no-repeat 50%/50% 50%;
}

.custom-checkbox .custom-control-label::before {
    border-radius: .25rem;
}

.custom-checkbox .custom-control-input:checked~.custom-control-label::after {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/%3e%3c/svg%3e");
}

.custom-checkbox .custom-control-input:disabled:checked~.custom-control-label::before {
    background-color: rgba(0, 123, 255, .5);
}

.custom-radio .custom-control-label::before {
    border-radius: 50%;
}

.custom-radio .custom-control-input:checked~.custom-control-label::after {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}

.custom-radio .custom-control-input:disabled:checked~.custom-control-label::before {
    background-color: rgba(0, 123, 255, .5);
}

.custom-control-label::before {
    transition: background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

@media (prefers-reduced-motion:reduce) {
    .custom-control-label::before {
        transition: none;
    }
}

.d-inline {
    display: inline !important;
}

.d-inline-block {
    display: inline-block !important;
}

.mt-2 {
    margin-top: .5rem !important;
}

.mr-2 {
    margin-right: .5rem !important;
}

.text-right {
    text-align: right !important;
}

.text-success {
    color: #28a745 !important;
}

.text-danger {
    color: #dc3545 !important;
}

@media print {

    *,
    ::after,
    ::before {
        text-shadow: none !important;
        box-shadow: none !important;
    }

    thead {
        display: table-header-group;
    }

    tr {
        page-break-inside: avoid;
    }

    .table {
        border-collapse: collapse !important;
    }

    .table td,
    .table th {
        background-color: #fff !important;
    }
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v208/static/front/css/control.css */
.text-success {
    color: var(--book-green) !important;
}

.text-danger {
    color: var(--book-red) !important;
}

label {
    font-size: var(--font-small);
    color: var(--text-body);
    margin-bottom: 8px;
}

.table-responsive {
    scrollbar-width: thin;
    scrollbar-height: thin;
    scrollbar-color: #666 #222;
    margin-bottom: 4px;
}

.table-responsive::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
    background: #666;
}

.table-responsive::-webkit-scrollbar-thumb {
    background-color: #222;
}

.table {
    border: 1px solid #3c444b;
    background-color: var(--bg-table);
    color: var(--text-table);
    table-layout: fixed;
}

.table thead th {
    border: 0;
    vertical-align: middle;
}

.table thead {
    background-color: var(--bg-table-header-new);
    color: var(--text-table-header-new);
}

.table td,
.table th {
    border: 0;
    border-bottom: 1px solid #3c444b;
    padding: 4px;
}

.custom-control-inline {
    line-height: 24px;
}

.custom-control-label {
    color: var(--text-body);
    line-height: unset;
}

.custom-control-label::before {
    background-color: #222;
}

.custom-control-input:checked~.custom-control-label::before {
    border-color: #222;
    background-color: #222;
    background-image: fill;
}

.kk-table td{
    background-color: transparent !important;            
}
            `}</style>
            <style>{`
.custom-radio .custom-control-input:checked~.custom-control-label::after {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23999'/%3e%3c/svg%3e");
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v208/static/front/css/style.css */
* {
    outline: 0 !important;
}

input {
    font-family: revert;
}

.vm {
    vertical-align: middle;
}

.back-border {
    border-left: 5px solid var(--back);
}

.bet-nation span {
    height: auto;
    font-size: var(--font-caption);
    letter-spacing: 0;
    line-height: 1;
    max-width: calc(100% - 20px);
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.report-table {
    margin-top: 0;
    min-height: 400px;
}

.report-table.report-table-modal {
    min-height: unset;
}

.casino-result .back-border {
    border-left: 5px solid var(--back);
}

.report-table .bet-nation {
    width: 150px;
}

.report-table .bet-nation div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-table .bet-user-rate {
    width: 110px;
}

.report-table .bet-user-rate div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-table .bet-amount {
    width: 170px;
}

.report-table .bet-amount div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-table .bet-date {
    width: 220px;
}

.report-table .bet-date div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-table .bet-remark {
    width: auto;
    cursor: pointer;
}

.report-table .bet-remark div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-table-modal.report-table .bet-remark {
    width: 300px;
    cursor: pointer;
}

.report-table-modal.report-table .bet-remark div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-table .bet-ip {
    cursor: pointer;
    width: 200px;
}

.report-table .bet-ip div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.total-soda {
    float: right;
}

.casino-result .bet-nation {
    width: 300px;
}

.casino-result .bet-nation>div {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.casino-result .bet-amount {
    width: 120px;
}

.casino-result .bet-amount div {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.casino-result .bet-date {
    width: 200px;
}

.casino-result .bet-date div {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.casino-result .bet-ip {
    width: 150px;
}

.casino-result .bet-ip div {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.casino-result .bet-remark {
    width: 160px;
}

.casino-result .bet-remark div {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.custom-control-input:disabled~.custom-control-label {
    color: inherit;
}

/*! CSS Used from: https://wver.sprintstaticdata.com/v208/static/front/css/responsive.css */
@media only screen and (min-width: 320px) and (max-width: 1279px) {
    .report-table {
        margin-top: 0;
    }

    label {
        margin-bottom: 4px;
        line-height: 16px;
    }

    .table {
        table-layout: unset;
    }
}

@media only screen and (min-width: 1280px) and (max-width: 1365px) {
    .report-table .bet-nation {
        width: 300px;
    }

    .report-table-modal.report-table .bet-remark {
        width: 100px;
    }

    .report-table .bet-user-rate {
        width: 100px;
    }

    .report-table .bet-amount {
        width: 170px;
    }

    .report-table .bet-date {
        width: 140px;
    }

    .report-table .bet-remark {
        width: auto;
    }
}

@media only screen and (min-width: 1366px) and (max-width: 1599px) {
    .report-table .bet-nation {
        width: 300px;
    }

    .report-table-modal.report-table .bet-remark {
        width: 100px;
    }

    .report-table .bet-user-rate {
        width: 80px;
    }

    .report-table .bet-amount {
        width: 120px;
    }

    .report-table .bet-date {
        width: 140px;
    }

    .report-table .bet-remark {
        width: auto;
    }
}

@media only screen and (min-width: 1280px) and (max-width: 1599px) {
    .bet-nation span {
        font-size: var(--font-13);
    }

    .table thead {
        height: auto;
    }

    .table td,
    .table th {
        padding: 6px;
    }
}

@media only screen and (min-width: 1600px) and (max-width: 1800px) {
    .report-table .bet-nation {
        width: 130px;
    }

    .report-table .bet-user-rate {
        width: 130px;
    }

    .report-table .bet-amount {
        width: 170px;
    }

    .report-table .bet-date {
        width: 210px;
    }

    .report-table .bet-remark {
        width: auto;
    }
}

@media only screen and (min-width: 320px) and (max-width: 767px) {
    .total-soda {
        float: unset;
    }

    .casino-result .bet-amount {
        width: 80px;
    }

    .casino-result .bet-date {
        width: 140px;
    }

    .casino-result .bet-ip {
        width: 100px;
    }

    .casino-result .bet-remark {
        width: 120px;
    }

    .custom-control-label {
        line-height: unset;
    }
}

/*! CSS Used from: Embedded */
.table-responsive {
    margin-bottom: 1rem;
}

.table-responsive>.table {
    margin-bottom: 0;
}            
            `}</style>
        </>
    )
}