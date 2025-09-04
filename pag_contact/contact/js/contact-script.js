    // Funcionalidad para la página de contacto
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar EmailJS con tu User ID
            // Reemplaza 'YOUR_USER_ID' con tu User ID de EmailJS
            emailjs.init("_OJi00zKar_pZYArU");
            
            // Funcionalidad para las preguntas frecuentes (acordeón)
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                
                question.addEventListener('click', () => {
                    // Cerrar otros items abiertos
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Alternar el item actual
                    item.classList.toggle('active');
                });
            });
            
            // Validación y envío del formulario
            const contactForm = document.getElementById('contactForm');
            
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Mostrar indicador de carga
                    document.getElementById('loadingIndicator').style.display = 'block';
                    
                    // Validación básica
                    const name = document.getElementById('name').value.trim();
                    const email = document.getElementById('email').value.trim();
                    const subject = document.getElementById('subject').value;
                    const message = document.getElementById('message').value.trim();
                    
                    if (!name || !email || !subject || !message) {
                        showMessage('Por favor, completa todos los campos.', 'error');
                        document.getElementById('loadingIndicator').style.display = 'none';
                        return;
                    }
                    
                    if (!isValidEmail(email)) {
                        showMessage('Por favor, introduce un correo electrónico válido.', 'error');
                        document.getElementById('loadingIndicator').style.display = 'none';
                        return;
                    }
                    
                    // Enviar el email usando EmailJS
                    // Reemplaza 'YOUR_SERVICE_ID' y 'YOUR_TEMPLATE_ID' con tus valores
                    emailjs.send('service_e8lzay1', 'template_qg38zo2', {
                        name: name,
                        email: email,
                        subject: subject,
                        message: message
                    })
                    .then(function(response) {
                        // Ocultar indicador de carga
                        document.getElementById('loadingIndicator').style.display = 'none';
                        
                        showMessage('¡Gracias por tu mensaje! Te responderemos pronto.', 'success');
                        contactForm.reset();
                    }, function(error) {
                        // Ocultar indicador de carga
                        document.getElementById('loadingIndicator').style.display = 'none';
                        
                        showMessage('Error al enviar el mensaje. Por favor, intenta nuevamente.', 'error');
                    });
                });
            }
            
            // Función para validar email
            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
            
            // Función para mostrar mensajes
            function showMessage(text, type) {
                // Crear elemento de mensaje si no existe
                let messageEl = document.querySelector('.form-message');
                
                if (!messageEl) {
                    messageEl = document.createElement('div');
                    messageEl.className = 'form-message';
                    contactForm.parentNode.insertBefore(messageEl, contactForm);
                }
                
                // Configurar y mostrar mensaje
                messageEl.textContent = text;
                messageEl.className = `form-message ${type}`;
                messageEl.style.display = 'block';
                
                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 5000);
            }
        });