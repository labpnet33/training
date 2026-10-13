var e={id:`volumes-dockerfile`,h:{en:`Keeping data with volumes, passing settings, and building your own image`,hi:`Volumes se data bachana, settings dena aur apni image banana`},body:{en:`
<p>Chapter 4 ended with a warning: remove a container and the files inside it disappear. This chapter shows how to keep data (<b>volumes</b>), how to pass settings and secrets without baking them into the image (<b>environment variables</b>), and how to package your own automation scripts as an image (<b>Dockerfile</b>). The simulator's container engine does not run volumes or builds, so every file and command here is labelled <b>Reference configuration (not run in the simulator)</b> and no output is shown.</p>

<h3>Analogy: a hotel room and a safe deposit box</h3>
<p>A hotel room is cleaned and reset after every guest: whatever you left on the table is gone. If you want something to survive, you put it in the hotel's safe deposit box, which belongs to you and stays when the room changes. The container's filesystem is the room; a <b>volume</b> is the safe deposit box.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Volume outlives the container">
<rect x="15" y="25" width="200" height="120" rx="12" fill="#fde68a"/><text x="115" y="50" text-anchor="middle" class="svg-ink" font-size="13">Container v1</text><text x="115" y="75" text-anchor="middle" class="svg-muted" font-size="12">own writable layer (lost on rm)</text><rect x="45" y="95" width="140" height="35" rx="8" fill="#bbf7d0"/><text x="115" y="118" text-anchor="middle" class="svg-ink" font-size="12">/app/results</text>
<rect x="430" y="25" width="200" height="120" rx="12" fill="#fde68a"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Container v2</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">replacement, new image</text><rect x="460" y="95" width="140" height="35" rx="8" fill="#bbf7d0"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="12">/app/results</text>
<rect x="250" y="95" width="140" height="50" rx="10" fill="#bae6fd"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Volume results</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="11">survives both</text>
<line x1="185" y1="112" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="460" y2="112" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The volume stays when containers come and go.</p></div>

<h3>Volumes</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
docker volume create results
docker run -d --name web -p 8080:80 -v results:/usr/share/nginx/html nginx</pre>
<ul>
<li><code>-v results:/usr/share/nginx/html</code> mounts the volume named <code>results</code> at that path inside the container.</li>
<li>Data written there is stored outside the container's own layer, so you can remove and recreate the container and the files remain.</li>
<li>A <b>bind mount</b> uses a host folder instead of a named volume: <code>-v /srv/results:/usr/share/nginx/html</code>. Handy for sharing config files from your repository; the host path must exist and permissions matter.</li>
</ul>
<p>Rule of thumb: anything you cannot afford to lose (databases, reports, state) lives on a volume or an external service; the container itself stays disposable.</p>

<h3>Environment variables for settings</h3>
<p>The same image should run in test and production. The difference is configuration, passed at start time as <b>environment variables</b> (name and value pairs):</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
docker run -d --name runner -e DEVICE_USER=netops -e DEVICE_LIST=routers.example python
docker run -d --name runner --env-file ./runner.env python</pre>
<p>The second form reads many variables from a file. A script reads them with <code>os.environ["DEVICE_USER"]</code>. <b>Secrets</b> such as device passwords need extra care: never write them into the image, the Dockerfile or the repository. Pass them at run time from your pipeline's secret store, keep any .env file out of Git (list it in .gitignore), and prefer the engine's secrets feature or a secret manager in production. Remember environment variables are visible in docker inspect output to anyone with access to the engine.</p>

<h3>Building your own image: the Dockerfile</h3>
<p>A <b>Dockerfile</b> is a text recipe, one instruction per line, that builds an image:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): Dockerfile for a test runner</span>
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER nobody
CMD ["python", "tests.py"]</pre>
<ul>
<li><code>FROM</code> chooses the starting image (pin a version tag).</li>
<li><code>WORKDIR</code> sets the folder inside the image for the following commands.</li>
<li><code>COPY requirements.txt .</code> copies the dependency list first, then <code>RUN pip install</code> installs it. Because Docker caches each step, this order means a code change does not reinstall every package.</li>
<li><code>COPY . .</code> copies your scripts.</li>
<li><code>USER nobody</code> runs the tool without root rights, a good defensive habit.</li>
<li><code>CMD</code> is the default command when the container starts.</li>
</ul>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): build and run</span>
docker build -t net-tests:1.0 .
docker run --rm --env-file ./runner.env -v results:/app/results net-tests:1.0</pre>
<p><code>-t net-tests:1.0</code> names and tags the image. <code>--rm</code> deletes the container when it finishes, ideal for one-shot jobs like a test run (module auto-testing). Add a <code>.dockerignore</code> file listing files that must never enter the image, such as .git, .env and local state.</p>

<div class="eg"><p><b>Worked example.</b> The Deccan Net runner image holds Python, the nkmiko-style SSH library, and tests.py. A nightly pipeline job builds net-tests with the build number as tag, runs it with --rm, passes device credentials from the secret store as variables, and writes the report to a mounted volume that the web dashboard also mounts. Replacing the image never loses a report.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Baking a password into the image with an ENV line or COPY of a secrets file. Anyone who can pull the image can read it, and image layers keep history. Another is relying on the tag latest for the base image.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know what persists: the container's writable layer dies with the container; volumes and bind mounts survive. Also, ENV in a Dockerfile is baked in and visible; runtime -e or secrets are injected at start.</p></div>

<div class="scn"><h4>The report folder that kept disappearing</h4><p>A team's test container wrote reports inside itself. Every redeploy removed the container and with it last week's reports, which management wanted for an audit. They mounted a named volume at the report path. After that, containers came and went freely and the reports stayed, and a backup job copied the volume nightly.</p><p><b>Lesson:</b> decide what must survive and put it on a volume.</p></div>

<div class="iv"><p class="q">"How do you persist data and handle secrets for containerised tools?"</p><p>Persist with volumes or bind mounts so data outlives the container. Pass configuration through environment variables or files at run time, never bake secrets into the image or Git; use the CI secret store or a secrets manager, run as a non-root user, and pin image tags.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A container's own writable layer is lost on rm; volumes and bind mounts survive.</li>
<li>-v NAME:PATH mounts a volume; -e or --env-file passes settings.</li>
<li>Never bake secrets into an image; inject them at run time.</li>
<li>A Dockerfile (FROM, WORKDIR, COPY, RUN, USER, CMD) builds your own image.</li>
<li>Use --rm for one-shot jobs and pin versions.</li>
</ul></div>
`,hi:`
<p>Chapter 4 ek chetawani par khatam hua tha: container remove karo to andar ki files gayab ho jaati hain. Yeh chapter dikhata hai data kaise rakhein (<b>volumes</b>), settings aur secrets ko image mein pakaye bina kaise dein (<b>environment variables</b>), aur apni automation scripts ko image ke roop mein kaise package karein (<b>Dockerfile</b>). Simulator ka container engine volumes ya builds nahi chalata, isliye yahan har file aur command par <b>Reference configuration (not run in the simulator)</b> likha hai aur koi output nahi dikhaya gaya.</p>

<h3>Analogy: hotel ka kamra aur safe deposit box</h3>
<p>Hotel ka kamra har guest ke baad saaf aur reset hota hai: jo aap table par chhod gaye woh gaya. Kuch bachana ho to aap use hotel ke safe deposit box mein rakhte ho, jo aapka hai aur kamra badalne par bhi rehta hai. Container ka filesystem kamra hai; <b>volume</b> safe deposit box hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Volume container se zyada jeeta hai">
<rect x="15" y="25" width="200" height="120" rx="12" fill="#fde68a"/><text x="115" y="50" text-anchor="middle" class="svg-ink" font-size="13">Container v1</text><text x="115" y="75" text-anchor="middle" class="svg-muted" font-size="12">apni writable layer (rm par gayi)</text><rect x="45" y="95" width="140" height="35" rx="8" fill="#bbf7d0"/><text x="115" y="118" text-anchor="middle" class="svg-ink" font-size="12">/app/results</text>
<rect x="430" y="25" width="200" height="120" rx="12" fill="#fde68a"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Container v2</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">replacement, nayi image</text><rect x="460" y="95" width="140" height="35" rx="8" fill="#bbf7d0"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="12">/app/results</text>
<rect x="250" y="95" width="140" height="50" rx="10" fill="#bae6fd"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Volume results</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="11">dono se zyada jeeta hai</text>
<line x1="185" y1="112" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="460" y2="112" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Containers aate-jaate hain, volume rehta hai.</p></div>

<h3>Volumes</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
docker volume create results
docker run -d --name web -p 8080:80 -v results:/usr/share/nginx/html nginx</pre>
<ul>
<li><code>-v results:/usr/share/nginx/html</code> <code>results</code> naam ke volume ko container ke andar us path par mount karta hai.</li>
<li>Wahan likha data container ki apni layer ke bahar store hota hai, isliye aap container remove aur recreate kar sakte ho aur files rehti hain.</li>
<li><b>Bind mount</b> named volume ki jagah host folder use karta hai: <code>-v /srv/results:/usr/share/nginx/html</code>. Apne repository ki config files share karne ke liye kaam ka; host path maujood hona chahiye aur permissions matter karti hain.</li>
</ul>
<p>Thumb rule: jo kho nahi sakte (databases, reports, state) woh volume ya external service par rehta hai; container khud disposable rehta hai.</p>

<h3>Settings ke liye environment variables</h3>
<p>Wahi image test aur production dono mein chalni chahiye. Farak configuration ka hai, jo start time par <b>environment variables</b> (naam aur value jodiyan) ke roop mein diya jaata hai:</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
docker run -d --name runner -e DEVICE_USER=netops -e DEVICE_LIST=routers.example python
docker run -d --name runner --env-file ./runner.env python</pre>
<p>Doosra form file se kai variables padhta hai. Script unhe <code>os.environ["DEVICE_USER"]</code> se padhti hai. Device passwords jaise <b>secrets</b> mein extra savdhani chahiye: unhe image, Dockerfile ya repository mein kabhi mat likho. Run time par pipeline ke secret store se do, .env file ko Git se bahar rakho (.gitignore mein), aur production mein engine ka secrets feature ya secret manager prefer karo. Yaad rakho environment variables engine tak access wale har insaan ko docker inspect output mein dikhte hain.</p>

<h3>Apni image banana: Dockerfile</h3>
<p><b>Dockerfile</b> text recipe hai, har line ek instruction, jo image banati hai:</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): test runner ka Dockerfile</span>
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER nobody
CMD ["python", "tests.py"]</pre>
<ul>
<li><code>FROM</code> shuruati image chunta hai (version tag pin karo).</li>
<li><code>WORKDIR</code> agle commands ke liye image ke andar ka folder set karta hai.</li>
<li><code>COPY requirements.txt .</code> pehle dependency list copy karta hai, phir <code>RUN pip install</code> use install karta hai. Docker har step cache karta hai, isliye is order se code change par har package dobara install nahi hota.</li>
<li><code>COPY . .</code> aapki scripts copy karta hai.</li>
<li><code>USER nobody</code> tool ko root rights ke bina chalata hai, achhi defensive aadat.</li>
<li><code>CMD</code> container start hone par default command hai.</li>
</ul>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): build aur run</span>
docker build -t net-tests:1.0 .
docker run --rm --env-file ./runner.env -v results:/app/results net-tests:1.0</pre>
<p><code>-t net-tests:1.0</code> image ko naam aur tag deta hai. <code>--rm</code> container ke khatam hote hi use delete karta hai, test run (module auto-testing) jaise one-shot jobs ke liye ideal. Ek <code>.dockerignore</code> file jodo jisme woh files hon jo image mein kabhi nahi jaani chahiye, jaise .git, .env aur local state.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net ki runner image mein Python, nkmiko-style SSH library aur tests.py hai. Raat ka pipeline job build number ko tag banakar net-tests build karta hai, --rm ke saath chalata hai, device credentials secret store se variables ke roop mein deta hai, aur report ek mounted volume mein likhta hai jise web dashboard bhi mount karta hai. Image replace karne se report kabhi nahi khoti.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> ENV line ya secrets file ke COPY se image mein password pakana. Image pull kar sakne wala koi bhi use padh sakta hai, aur image layers history rakhti hain. Ek aur: base image ke liye latest tag par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano kya bachta hai: container ki writable layer container ke saath marti hai; volumes aur bind mounts bachte hain. Aur Dockerfile ka ENV pakaya hua aur visible hai; runtime -e ya secrets start par inject hote hain.</p></div>

<div class="scn"><h4>Report folder jo gayab hota raha</h4><p>Ek team ka test container reports apne andar likhta tha. Har redeploy container hata deta tha aur saath mein pichhle hafte ki reports, jo management ko audit ke liye chahiye thi. Unhone report path par named volume mount kiya. Uske baad containers freely aate-jaate rahe aur reports rahi, aur backup job volume ko roz raat copy karta tha.</p><p><b>Lesson:</b> tay karo kya bachna chahiye aur use volume par rakho.</p></div>

<div class="iv"><p class="q">"Containerised tools ke liye data persist aur secrets kaise sambhalte ho?"</p><p>Volumes ya bind mounts se persist karo taaki data container se zyada jeeye. Configuration environment variables ya files se run time par do, secrets ko image ya Git mein kabhi mat pakao; CI secret store ya secrets manager use karo, non-root user se chalao, aur image tags pin karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Container ki apni writable layer rm par jaati hai; volumes aur bind mounts bachte hain.</li>
<li>-v NAME:PATH volume mount karta hai; -e ya --env-file settings deta hai.</li>
<li>Secrets ko image mein kabhi mat pakao; run time par inject karo.</li>
<li>Dockerfile (FROM, WORKDIR, COPY, RUN, USER, CMD) apni image banata hai.</li>
<li>One-shot jobs ke liye --rm use karo aur versions pin karo.</li>
</ul></div>
`}};export{e as default};