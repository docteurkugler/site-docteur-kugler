
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                footer {
                    background-color: #305CDE;
                    color: white;
padding: 1.5rem;
                    font-family: 'Poppins', sans-serif;
                    position: relative;
                    text-align: center;
                }
                
                .footer-bottom {
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 0.9rem;
                    color: #94a3b8;
                }
                .footer-bottom a {
                    color: white;
                    text-decoration: underline;
                    transition: all 0.3s ease;
                }
                
                .footer-bottom a:hover {
                    color: #f3f4f6;
text-decoration: underline;
                }
            </style>
            
            <footer>
                <div class="footer-bottom">
                    &copy; ${new Date().getFullYear()} - Tous droits réservés
                    <br>
                    <a href="admin-login.html" class="mt-2 inline-block">
                        <i data-feather="lock" class="mr-1 text-[#305CDE]"></i>
                        Espace professionnel
                    </a>
</div>
            </footer>
`;
    }
}
customElements.define('custom-footer', CustomFooter);