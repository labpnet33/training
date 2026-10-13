var e={id:`compose`,h:{en:`Docker Compose: describe the whole toolset in one file`,hi:`Docker Compose: poora toolset ek file mein describe karo`},body:{en:`
<p>Starting three containers with three long <code>docker run</code> commands is tedious and easy to get wrong. <b>Docker Compose</b> lets you write the whole setup once in a YAML file and start, stop and remove it with one command. This is the chapter where everything from the module comes together. The simulator's container engine does not run compose, so everything here is labelled <b>Reference configuration (not run in the simulator)</b> and no output is shown that a real tool did not print for you.</p>

<h3>Analogy: a seating plan for a wedding</h3>
<p>A wedding planner does not tell each guest where to sit, one by one, every time. She writes a <b>seating plan</b>: who sits where, who sits near whom, what each table needs. Hand the plan to the staff and the whole hall is arranged. A compose file is the seating plan for your containers. YAML (module auto-formats) is just indentation-based key and value text.</p>

<h3>A compose file for an automation toolset</h3>
<p>Three services: a <b>runner</b> that executes the test scripts, a <b>db</b> that stores results, and a <b>dashboard</b> web page. The file is named <code>compose.yaml</code>.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): compose.yaml</span>
services:
  db:
    image: postgres:16
    env_file: ./db.env
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "netops"]
      interval: 10s
      retries: 5

  runner:
    build: ./runner
    env_file: ./runner.env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - results:/app/results

  dashboard:
    image: nginx:1.27
    ports:
      - "8080:80"
    volumes:
      - results:/usr/share/nginx/html:ro

volumes:
  dbdata:
  results:</pre>

<h3>Reading it line by line</h3>
<ul>
<li><code>services:</code> starts the list of containers. Each name under it (<code>db</code>, <code>runner</code>, <code>dashboard</code>) is a <b>service</b>.</li>
<li><code>image:</code> pulls a ready-made image, with a pinned version tag. <code>build: ./runner</code> builds an image from the Dockerfile in that folder instead (chapter 6).</li>
<li><code>env_file:</code> loads environment variables from a file kept <b>out of Git</b>. The password for the database lives in <code>db.env</code>, never in compose.yaml.</li>
<li><code>volumes:</code> under a service mounts storage. The names <code>dbdata</code> and <code>results</code> are declared at the bottom. The dashboard mounts results with <code>:ro</code> (read-only), so it can show reports but never change them.</li>
<li><code>ports:</code> publishes only the dashboard. The database and the runner have no ports, so nothing outside the host can reach them.</li>
<li><code>depends_on</code> with <code>service_healthy</code> makes the runner wait until the database's <b>healthcheck</b> passes. The healthcheck runs a small command (<code>pg_isready</code>) every ten seconds.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Compose services">
<rect x="15" y="20" width="610" height="165" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">compose project: one private network created for you</text>
<rect x="40" y="70" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="110" y="97" text-anchor="middle" class="svg-ink" font-size="13">db</text><text x="110" y="115" text-anchor="middle" class="svg-muted" font-size="11">no published port</text>
<rect x="250" y="70" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">runner</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="11">waits for db healthy</text>
<rect x="460" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="13">dashboard</text><text x="530" y="115" text-anchor="middle" class="svg-muted" font-size="11">8080 to 80</text>
<line x1="250" y1="100" x2="180" y2="100" stroke="#64748b" stroke-width="2"/><text x="215" y="93" text-anchor="middle" class="svg-accent" font-size="10">by name db</text>
<text x="395" y="160" text-anchor="middle" class="svg-muted" font-size="11">runner and dashboard share the results volume</text>
</svg><p class="cap">Services find each other by service name on a private project network.</p></div>

<h3>Networking comes free</h3>
<p>Compose creates a private network for the project and attaches every service to it. Each service is reachable by its <b>service name</b>: the runner connects to the database at the host name <code>db</code>, as chapter 5 promised, and nothing needs hard-coded IP addresses.</p>

<h3>The daily commands</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): run in the folder with compose.yaml</span>
docker compose up -d          <span class="c"># create networks and volumes, build or pull images, start everything</span>
docker compose ps             <span class="c"># state of the services</span>
docker compose logs runner    <span class="c"># what the runner printed</span>
docker compose down           <span class="c"># stop and remove containers and the network (named volumes are kept)</span></pre>
<p><code>docker compose down</code> keeps named volumes by default so your data is safe; adding the volumes option to down deletes them as well, which is destructive. Changing a line in compose.yaml and running <code>up -d</code> again recreates only the services that changed, which is the declarative idea you met in module auto-terraform at small scale: describe the end state, let the tool converge.</p>

<h3>Why this suits automation work</h3>
<ul>
<li>The whole toolset is a text file that lives in Git (module auto-git) and is reviewed like code.</li>
<li>A new engineer runs one command and gets the same environment.</li>
<li>A pipeline (module auto-cicd) can start the same file for integration tests and tear it down afterwards.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Read the file above aloud like a manager: "There are three services. The database stores its files in a volume and has no outside access. The runner waits for the database, then runs and writes reports to a shared volume. The dashboard shows those reports, read-only, on port 8080." If you can say that, you can read any compose file.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> YAML indentation errors: using tabs or mixing indentation widths, which makes the file invalid. Use spaces only. Another mistake is writing passwords directly in compose.yaml and committing it. Keep them in an env file that is in .gitignore, or in the platform's secrets.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a compose file, <code>ports</code> exposes a service outside the host; services reach each other by name without any ports entry. <code>depends_on</code> controls start order, but only with a healthcheck condition does it wait until the dependency is actually ready. Compose down keeps named volumes unless told otherwise.</p></div>

<div class="scn"><h4>The runner that started too early</h4><p>A compose setup started the test runner and the database together. The runner's first connection failed because the database was still initialising, and the job exited with an error every few mornings. The team added a healthcheck to the database and a depends_on with the service_healthy condition. The runner then waited, and the flaky start disappeared.</p><p><b>Lesson:</b> started is not the same as ready.</p></div>

<div class="iv"><p class="q">"What is Docker Compose and why use it for automation tooling?"</p><p>Compose describes a multi-container application (services, images or builds, ports, volumes, environment, dependencies) in one YAML file and manages it with up and down. It gives repeatable environments, automatic networking by service name, and files you can version and review. Mention healthchecks, env files for secrets and keeping the database unpublished.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A compose file lists services, each with an image or build, ports, volumes and environment.</li>
<li>Services reach each other by service name on an automatic private network.</li>
<li>Publish only what must be reachable; secrets come from env files outside Git.</li>
<li>depends_on with a healthcheck waits for readiness, not just start.</li>
<li>docker compose up -d starts, down removes containers but keeps named volumes.</li>
</ul></div>
`,hi:`
<p>Teen lambe <code>docker run</code> commands se teen containers start karna thaka dene wala aur galti-prone hai. <b>Docker Compose</b> poora setup ek baar YAML file mein likhne deta hai aur ek command se start, stop aur remove karne deta hai. Is chapter mein module ki saari cheezein ek saath aati hain. Simulator ka container engine compose nahi chalata, isliye yahan sab kuch par <b>Reference configuration (not run in the simulator)</b> likha hai aur koi output nahi dikhaya gaya jo asli tool ne aapke liye print na kiya ho.</p>

<h3>Analogy: shaadi ka seating plan</h3>
<p>Wedding planner har baar har guest ko ek-ek karke nahi batati ki kahan baithna hai. Woh ek <b>seating plan</b> likhti hai: kaun kahan, kaun kiske paas, har table ko kya chahiye. Plan staff ko do aur poora hall set ho jaata hai. Compose file aapke containers ka seating plan hai. YAML (module auto-formats) bas indentation par based key aur value text hai.</p>

<h3>Automation toolset ki compose file</h3>
<p>Teen services: test scripts chalane wala <b>runner</b>, results store karne wala <b>db</b>, aur <b>dashboard</b> web page. File ka naam <code>compose.yaml</code> hai.</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): compose.yaml</span>
services:
  db:
    image: postgres:16
    env_file: ./db.env
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "netops"]
      interval: 10s
      retries: 5

  runner:
    build: ./runner
    env_file: ./runner.env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - results:/app/results

  dashboard:
    image: nginx:1.27
    ports:
      - "8080:80"
    volumes:
      - results:/usr/share/nginx/html:ro

volumes:
  dbdata:
  results:</pre>

<h3>Line by line padhna</h3>
<ul>
<li><code>services:</code> containers ki list shuru karta hai. Uske neeche har naam (<code>db</code>, <code>runner</code>, <code>dashboard</code>) ek <b>service</b> hai.</li>
<li><code>image:</code> pinned version tag ke saath ready-made image pull karta hai. <code>build: ./runner</code> uske bajaye us folder ke Dockerfile se image banata hai (chapter 6).</li>
<li><code>env_file:</code> ek file se environment variables load karta hai jo <b>Git se bahar</b> rakhi hai. Database ka password <code>db.env</code> mein rehta hai, compose.yaml mein kabhi nahi.</li>
<li>Service ke neeche <code>volumes:</code> storage mount karta hai. <code>dbdata</code> aur <code>results</code> naam neeche declare hain. Dashboard results ko <code>:ro</code> (read-only) se mount karta hai, taaki reports dikha sake par badal na sake.</li>
<li><code>ports:</code> sirf dashboard ko publish karta hai. Database aur runner ke koi ports nahi, isliye host ke bahar se koi unhe nahi chhu sakta.</li>
<li><code>service_healthy</code> ke saath <code>depends_on</code> runner ko tab tak rokta hai jab tak database ka <b>healthcheck</b> pass na ho. Healthcheck har dus second mein chhota command (<code>pg_isready</code>) chalata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Compose services">
<rect x="15" y="20" width="610" height="165" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">compose project: aapke liye ek private network bana</text>
<rect x="40" y="70" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="110" y="97" text-anchor="middle" class="svg-ink" font-size="13">db</text><text x="110" y="115" text-anchor="middle" class="svg-muted" font-size="11">koi published port nahi</text>
<rect x="250" y="70" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">runner</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="11">db healthy ka intezaar</text>
<rect x="460" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="13">dashboard</text><text x="530" y="115" text-anchor="middle" class="svg-muted" font-size="11">8080 se 80</text>
<line x1="250" y1="100" x2="180" y2="100" stroke="#64748b" stroke-width="2"/><text x="215" y="93" text-anchor="middle" class="svg-accent" font-size="10">naam db se</text>
<text x="395" y="160" text-anchor="middle" class="svg-muted" font-size="11">runner aur dashboard results volume share karte hain</text>
</svg><p class="cap">Services private project network par service name se ek-doosre ko dhoondhti hain.</p></div>

<h3>Networking free mein</h3>
<p>Compose project ke liye private network banata hai aur har service ko usse jodta hai. Har service uske <b>service name</b> se reachable hai: runner database se host name <code>db</code> par connect hota hai, jaise chapter 5 ne vaada kiya tha, aur kisi hard-coded IP address ki zaroorat nahi.</p>

<h3>Roz ke commands</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): compose.yaml wale folder mein chalao</span>
docker compose up -d          <span class="c"># networks aur volumes banao, images build ya pull karo, sab start karo</span>
docker compose ps             <span class="c"># services ki state</span>
docker compose logs runner    <span class="c"># runner ne kya print kiya</span>
docker compose down           <span class="c"># containers aur network rokkar remove karo (named volumes bachte hain)</span></pre>
<p><code>docker compose down</code> default mein named volumes rakhta hai taaki aapka data safe rahe; down mein volumes option jodne par woh bhi delete ho jaate hain, jo destructive hai. compose.yaml ki ek line badalkar <code>up -d</code> dobara chalane se sirf badli hui services recreate hoti hain, jo module auto-terraform mein dekha declarative idea chhote scale par hai: end state describe karo, tool converge karne do.</p>

<h3>Automation kaam ke liye yeh kyun fit hai</h3>
<ul>
<li>Poora toolset text file hai jo Git (module auto-git) mein rehti hai aur code ki tarah review hoti hai.</li>
<li>Naya engineer ek command chalata hai aur wahi environment paata hai.</li>
<li>Pipeline (module auto-cicd) wahi file integration tests ke liye start kar sakti hai aur baad mein hata sakti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Upar ki file manager ki tarah zor se padho: "Teen services hain. Database apni files volume mein rakhta hai aur uska bahar se access nahi. Runner database ka intezaar karta hai, phir chalta hai aur reports shared volume mein likhta hai. Dashboard woh reports read-only port 8080 par dikhata hai." Yeh bol sakte ho to koi bhi compose file padh sakte ho.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> YAML indentation errors: tabs use karna ya indentation widths milana, jisse file invalid ho jaati hai. Sirf spaces use karo. Ek aur galti: passwords seedhe compose.yaml mein likhkar commit kar dena. Unhe .gitignore wali env file mein ya platform ke secrets mein rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Compose file mein <code>ports</code> service ko host ke bahar expose karta hai; services ek-doosre tak bina kisi ports entry ke naam se pahunchti hain. <code>depends_on</code> start order control karta hai, par healthcheck condition ke saath hi woh tab tak rukta hai jab dependency sach mein ready ho. Compose down named volumes rakhta hai jab tak alag se na kaha jaaye.</p></div>

<div class="scn"><h4>Runner jo bahut jaldi start hua</h4><p>Ek compose setup ne test runner aur database saath start kiye. Runner ka pehla connection fail hua kyunki database abhi initialise ho raha tha, aur job har kuch subah error ke saath exit hota tha. Team ne database mein healthcheck aur service_healthy condition wala depends_on jodha. Runner phir intezaar karne laga, aur flaky start gayab ho gaya.</p><p><b>Lesson:</b> started aur ready ek jaise nahi hain.</p></div>

<div class="iv"><p class="q">"Docker Compose kya hai aur automation tooling ke liye kyun use karte ho?"</p><p>Compose multi-container application (services, images ya builds, ports, volumes, environment, dependencies) ko ek YAML file mein describe karta hai aur up aur down se manage karta hai. Repeatable environments, service name se automatic networking, aur aisi files deta hai jo version aur review ho sakein. Healthchecks, secrets ke liye env files aur database ko unpublished rakhne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Compose file services list karti hai, har ek image ya build, ports, volumes aur environment ke saath.</li>
<li>Services automatic private network par service name se ek-doosre tak pahunchti hain.</li>
<li>Sirf wahi publish karo jo reachable hona chahiye; secrets Git ke bahar env files se.</li>
<li>Healthcheck ke saath depends_on readiness ka intezaar karta hai, sirf start ka nahi.</li>
<li>docker compose up -d start karta hai, down containers hatata hai par named volumes rakhta hai.</li>
</ul></div>
`}};export{e as default};