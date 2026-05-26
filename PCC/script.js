(() => {
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

    // ==========================================
    // 1. MATRIX BACKGROUND
    // ==========================================
    const canvas = $("#matrix");
    const ctx = canvas.getContext("2d", { alpha: true });
    const state = {
        fontSize: 16, columns: 0, drops: [],
        chars: "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*+-=<>?/\\",
        lastTime: 0, speed: 0.06, opacity: 0.08, running: true
    };

    function resizeCanvas(){
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state.fontSize = window.innerWidth < 520 ? 14 : 16;
        state.columns = Math.floor(window.innerWidth / state.fontSize);
        state.drops = new Array(state.columns).fill(0).map(() => Math.random() * window.innerHeight / state.fontSize);
    }

    function drawMatrix(dt){
        if(!state.running) return;
        ctx.fillStyle = `rgba(0, 0, 0, ${state.opacity})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = "rgba(0, 255, 102, 0.9)";
        ctx.font = `${state.fontSize}px Share Tech Mono, ui-monospace, monospace`;

        for(let i=0; i<state.drops.length; i++){
            const x = i * state.fontSize;
            const y = state.drops[i] * state.fontSize;
            ctx.fillText(state.chars[Math.floor(Math.random() * state.chars.length)], x, y);
            if(y > window.innerHeight && Math.random() > 0.975) state.drops[i] = 0;
            state.drops[i] += (dt * state.speed) * (0.7 + Math.random() * 1.2);
        }
    }

    function loop(t){
        const dt = state.lastTime ? (t - state.lastTime) : 16;
        state.lastTime = t;
        drawMatrix(dt);
        requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();
    requestAnimationFrame(loop);

    // ==========================================
    // 2. TEXTE ANIMÉ
    // ==========================================
    const typedEl = $("#typed");
    const phrases = [
        "Evan ETHEVE - Étudiant BTS SIO SLAM.",
        "Lycée Georges Brassens (Rive-de-Gier).",
        "Dossier d'analyse - Parcours Certification."
    ];
    let pi = 0, ci = 0, del = false, hold = 0;

    function tick(){
        if(!typedEl) return;
        const current = phrases[pi];
        if(!del){
            typedEl.textContent = current.slice(0, ci++);
            if(ci > current.length){ del = true; hold = 28; }
        } else {
            if(hold-- <= 0){
                typedEl.textContent = current.slice(0, ci--);
                if(ci < 0){ del = false; pi = (pi + 1) % phrases.length; ci = 0; }
            }
        }
        setTimeout(tick, del ? 18 : 26);
    }
    tick();

    // ==========================================
    // 3. REVEAL SCROLL & NAV
    // ==========================================
    const revealEls = $$(".reveal");
    const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
            if(ent.isIntersecting){
                ent.target.classList.add("is-in");
                io.unobserve(ent.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));

    const navLinks = $$(".nav__link").filter(a => a.getAttribute("href")?.startsWith("#"));
    const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
    const ioNav = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
            if(ent.isIntersecting){
                const id = "#" + ent.target.id;
                navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === id));
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(s => ioNav.observe(s));

    // ==========================================
    // 4. MODALE & DATA (DOSSIERS COMPLETS)
    // ==========================================
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalClose = document.getElementById("modalClose");
    const modalOk = document.getElementById("modalOk");

    const certDetails = {
        cnil: {
            title: "MOOC de la CNIL (L'Atelier RGPD)",
            cost: "Gratuit",
            context: "Personnel / En cours",
            images: ["img/cnil.jpg"],
            tech: ["RGPD", "Droit numérique", "Cybersécurité"],
            orga: "La CNIL (Commission Nationale de l'Informatique et des Libertés) est une autorité administrative indépendante publique française. Elle est chargée de veiller à la protection des données personnelles.",
            parcours: "L'Atelier RGPD sensibilise les professionnels aux obligations légales via 4 modules. La certification atteste de la compréhension des principes clés (Privacy by Design, traitement des bases de données).",
            comparaison: "J'aurais pu m'orienter vers la certification ISO 27001 (Sécurité de l'information), mais elle est très coûteuse et axée sur le management. Le MOOC de la CNIL est gratuit, officiel, et vital pour un développeur.",
            demarche_resultat: "J'ai suivi les modules à mon rythme, en prenant des notes sur les règles de consentement et la sécurisation des bases de données. À l'issue des évaluations, j'ai validé mes acquis avec un score suffisant pour l'attestation.",
            conclusion: "Cette certification m'apporte une conscience légale indispensable. Sur un CV, cela garantit à l'employeur que mes applications respecteront la loi. Lors de mes projets, je l'ai mise en œuvre en veillant à la gestion stricte des données utilisateurs."
        },
        wordpress: {
            title: "Certification / Maîtrise WordPress",
            cost: "Gratuit",
            context: "En Stage",
            images: ["img/wordpress.png"],
            tech: ["WordPress", "PHP", "Elementor", "WooCommerce"],
            orga: "Projet Open-Source géré par la fondation WordPress, propulsant plus de 40% des sites web mondiaux.",
            parcours: "Le but était d'apprendre à construire un site professionnel de A à Z en suivant un processus strict (Wireframe, Maquette, Site), et de gérer des tâches complexes (boutique en ligne, responsive design).",
            comparaison: "En tant qu'étudiant SLAM, j'aurais pu tout coder 'from scratch' (ex: Laravel). Cependant, WordPress est une demande massive des agences web car il permet un déploiement rapide et donne au client l'autonomie sur le CMS.",
            demarche_resultat: "Ma démarche a été l'apprentissage 'sur le tas' lors de mes deux stages (notamment chez Innolive). J'ai appris à maîtriser Elementor, WooCommerce, et le CSS Responsive. Les résultats ont été concrets avec la livraison de vrais sites clients.",
            conclusion: "Cette compétence me donne un profil très polyvalent. Savoir développer du code complexe (C#, Laravel) tout en maîtrisant les CMS majeurs du marché est un argument fort sur mon CV pour intégrer une agence de communication digitale."
        },
        secnumacad: {
            title: "SecNumacadémie (ANSSI)",
            cost: "Gratuit",
            context: "Scolaire / Personnel",
            images: ["img/secnum.jpg"],
            tech: ["Cybersécurité", "Sécurité Web"],
            orga: "L'ANSSI (Agence Nationale de la Sécurité des Systèmes d'Information) est l'autorité nationale française en matière de cyberdéfense.",
            parcours: "Composé de 4 modules d'une durée d'environ 20 heures, le but est de sensibiliser aux menaces informatiques (mots de passe, hameçonnage, sécurité des postes et du web).",
            comparaison: "Les certifications purement offensives (CEH) ou réseau (Cisco CyberOps) sont intéressantes mais parfois trop spécifiques. L'ANSSI est le standard gouvernemental parfait pour poser des bases saines en sécurité.",
            demarche_resultat: "J'ai validé les différents modules à travers des cours théoriques et des validations de connaissances régulières. J'ai obtenu l'attestation de réussite globale du parcours.",
            conclusion: "Pour mon profil de développeur (SLAM), c'est essentiel. Je sais désormais que je dois sécuriser mes formulaires, hacher mes mots de passe et me prémunir contre les injections SQL, des compétences que je valorise sur mes projets web."
        },
        pix: {
            title: "Certification PIX",
            cost: "Gratuit",
            context: "Scolaire",
            images: ["img/pix.svg"],
            tech: ["Culture Numérique", "Recherche Web", "Données"],
            orga: "PIX est un service public en ligne français d'évaluation et de certification des compétences numériques.",
            parcours: "L'objectif est d'évaluer le niveau global de maîtrise de l'outil informatique : recherche d'information, manipulation de données, communication et sécurité de base.",
            comparaison: "PIX remplace les anciens C2i et B2i. C'est aujourd'hui le standard national reconnu par l'État et le monde professionnel pour évaluer la culture numérique générale.",
            demarche_resultat: "Je me suis entraîné régulièrement sur la plateforme en résolvant des défis adaptatifs. J'ai ensuite passé l'épreuve de certification officielle dans les conditions d'examen pour figer mon score.",
            conclusion: "Cette certification est une base incontournable. Elle démontre à mes futurs recruteurs ma totale aisance, ma polyvalence numérique et ma capacité à chercher efficacement des solutions de manière autonome."
        },
        office: {
            title: "Certification Office",
            cost: "Payant (Inclus Scolarité)",
            context: "Scolaire",
            images: ["img/office.jpg"],
            tech: ["Excel", "Word", "PowerPoint"],
            orga: "Microsoft Corporation, l'éditeur mondial de la suite bureautique la plus utilisée en entreprise.",
            parcours: "L'objectif est d'aller au-delà de l'utilisation basique pour maîtriser les fonctions expertes des logiciels de bureautique (publipostage, gestion de données complexes).",
            comparaison: "D'autres organismes (comme TOSA ou ENI) évaluent ces compétences, mais être certifié directement sur les standards du monde de l'entreprise est un gage d'efficacité immédiate.",
            demarche_resultat: "La préparation s'est faite via des cas pratiques réguliers (ex: création de tableaux croisés dynamiques, macro-commandes). Les évaluations ont validé ma capacité à traiter de l'information brute.",
            conclusion: "Le développement ne s'arrête pas au code. Savoir rédiger une documentation technique irréprochable sous Word ou analyser des jeux d'essais sous Excel est indispensable, notamment pour la rédaction de mes cahiers des charges."
        },
        rootme: {
            title: "RootMe",
            cost: "Gratuit",
            context: "Personnel",
            images: ["img/rootme.png"],
            tech: ["Hacking Éthique", "Réseau", "Failles Web"],
            orga: "Root-Me est une association française à but non lucratif promouvant la diffusion des connaissances en sécurité informatique.",
            parcours: "Il ne s'agit pas d'un QCM mais d'une plateforme d'apprentissage par la pratique (CTF - Capture The Flag). Le but est d'exploiter des vulnérabilités dans des environnements virtuels sécurisés.",
            comparaison: "Comparé à des plateformes anglophones (TryHackMe, HackTheBox), Root-Me est francophone et propose un cheminement très didactique, parfait pour initier une démarche de hacking éthique.",
            demarche_resultat: "J'ai résolu plusieurs défis techniques en autonomie, m'obligeant à faire des recherches poussées sur le fonctionnement des requêtes HTTP, l'analyse de code source et les vulnérabilités classiques (XSS).",
            conclusion: "Avoir une mentalité 'offensive' (savoir comment les pirates attaquent) est le meilleur moyen de développer un code 'défensif' robuste. Cette pratique m'aide directement à sécuriser mes applications et API."
        }
    };

    let currentSlideIndex = 0;

    function buildModalContent(key) {
        const p = certDetails[key];
        if (!p) return "<p>Données introuvables.</p>";

        const slidesHtml = p.images.map((src, i) => `
            <img src="${src}" class="carousel__slide ${i === 0 ? 'active' : ''}" onerror="this.src='https://via.placeholder.com/600x300/000/0f0?text=Image+Non+Trouv%C3%A9e'">
        `).join("");

        const dotsHtml = p.images.map((_, i) => `
            <div class="carousel__dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
        `).join("");

        const techTags = p.tech.map(t => `<span class="tag">${t}</span>`).join("");

        const badgesHtml = `
            <span class="tag" style="background:#000; border: 1px solid #00ffff; color:#00ffff;">[ ${p.cost} ]</span>
            <span class="tag" style="background:#000; border: 1px solid #ff00ff; color:#ff00ff;">[ ${p.context} ]</span>
        `;

        return `
            <div class="modal__grid">
                <div>
                    <div class="carousel">
                        ${p.images.length > 1 ? '<button class="carousel__btn carousel__btn--prev" onclick="moveSlide(-1)">&#10094;</button>' : ''}
                        <div class="carousel__slides">${slidesHtml}</div>
                        ${p.images.length > 1 ? '<button class="carousel__btn carousel__btn--next" onclick="moveSlide(1)">&#10095;</button>' : ''}
                        <div class="carousel__dots">${dotsHtml}</div>
                    </div>
                    <div style="margin-top: 15px;">${badgesHtml}</div>
                    <div style="margin-top: 10px;">${techTags}</div>
                </div>

                <div>
                    <div class="analysis-block">
                        <h4 class="analysis-title">1. L'Organisation & Le Parcours</h4>
                        <p class="analysis-text"><strong>Certifieur :</strong> ${p.orga}</p>
                        <p class="analysis-text"><strong>Le Parcours :</strong> ${p.parcours}</p>
                    </div>

                    <div class="analysis-block">
                        <h4 class="analysis-title">2. Comparaison & Choix</h4>
                        <p class="analysis-text">${p.comparaison}</p>
                    </div>

                    <div class="analysis-block">
                        <h4 class="analysis-title">3. Démarche [CRITÈRE 4] & Résultats [CRITÈRE 5]</h4>
                        <p class="analysis-text">${p.demarche_resultat}</p>
                    </div>

                    <div class="analysis-block">
                        <h4 class="analysis-title" style="color: #ffcc00; border-bottom-color: #ffcc00;">4. Bilan & Valorisation (Stage/CV)</h4>
                        <p class="analysis-text">${p.conclusion}</p>
                    </div>
                </div>
            </div>
        `;
    }

    window.moveSlide = function(step) {
        const slides = document.querySelectorAll(".carousel__slide");
        const dots = document.querySelectorAll(".carousel__dot");
        if(!slides.length) return;
        slides[currentSlideIndex].classList.remove("active");
        if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.remove("active");
        currentSlideIndex = (currentSlideIndex + step + slides.length) % slides.length;
        slides[currentSlideIndex].classList.add("active");
        if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");
    };

    window.goToSlide = function(index) {
        const slides = document.querySelectorAll(".carousel__slide");
        const dots = document.querySelectorAll(".carousel__dot");
        slides[currentSlideIndex].classList.remove("active");
        if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.remove("active");
        currentSlideIndex = index;
        slides[currentSlideIndex].classList.add("active");
        if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");
    };

    function openModal(key){
        const d = certDetails[key];
        if(!d || !modal) return;
        currentSlideIndex = 0;
        modalTitle.textContent = ">_ ./analyser_" + key + ".exe";
        modalBody.innerHTML = buildModalContent(key);
        modal.showModal();
    }

    function closeModal(){ if(modal?.open) modal.close(); }

    modalClose?.addEventListener("click", closeModal);
    modalOk?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
        const inner = modal.querySelector(".modal__inner");
        if(inner && !inner.contains(e.target)) closeModal();
    });

    $$(".cert-card").forEach(card => {
        const key = card.dataset.modal;
        card.addEventListener("click", () => openModal(key));
    });


    // ==========================================
    // 5. PREUVE DE CONCEPT : THREE.JS (The Creep)
    // ==========================================
    const threeContainer = document.getElementById('threejs-container');
    
    // Vérifier si le conteneur existe ET si la bibliothèque Three.js a bien été chargée
    if (threeContainer && window.THREE) {
        
        // 1. Initialiser la Scène
        const scene = new THREE.Scene();
        // Un brouillard vert horrifique pour coller au style
        scene.fog = new THREE.FogExp2(0x002200, 0.15); 

        // 2. Initialiser la Caméra
        const camera = new THREE.PerspectiveCamera(75, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000);
        camera.position.z = 2.5;

        // 3. Initialiser le Moteur de Rendu (WebGL)
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
        threeContainer.appendChild(renderer.domElement);

        // 4. Créer un objet "Creepy" (Une Icosahedron en fil de fer vert)
        const geometry = new THREE.IcosahedronGeometry(1, 0); // Forme polygonale chaotique
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const spookyObject = new THREE.Mesh(geometry, material);
        scene.add(spookyObject);

        // 5. Boucle d'animation
        function animateThreeJS() {
            requestAnimationFrame(animateThreeJS);

            // Rotation angoissante de l'objet
            spookyObject.rotation.x += 0.005;
            spookyObject.rotation.y += 0.01;

            // Effet de pulsation mathématique (Vecteurs)
            const time = Date.now() * 0.003;
            const scale = 1 + Math.sin(time) * 0.15; // Palpite comme un coeur
            spookyObject.scale.set(scale, scale, scale);

            renderer.render(scene, camera);
        }
        animateThreeJS();

        // 6. Gérer le redimensionnement de l'écran pour garder les proportions 3D
        window.addEventListener('resize', () => {
            if(!threeContainer) return;
            const width = threeContainer.clientWidth;
            const height = threeContainer.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
    }

})();