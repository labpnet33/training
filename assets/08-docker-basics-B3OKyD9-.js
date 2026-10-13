var e={id:`docker-basics`,h:{en:`Docker basics: images, containers, ports, volumes, registries and tags`,hi:`Docker basics: images, containers, ports, volumes, registries aur tags`},body:{en:`
<p>A recipe card and a cooked meal are different things. The card (an <b>image</b>) is a read-only, shareable description with everything needed: ingredients, steps, even the pan. Each time you follow it you get a hot meal (a <b>container</b>). You can cook ten meals from one card, and throwing a meal away never damages the card. Docker is the kitchen that reads cards and cooks meals. This chapter is blueprint 4.6; chapter 9 turns your own Python app into a card.</p>

<h3>The vocabulary</h3>
<dl class="terms">
<dt>Image</dt><dd>A read-only package: app code, libraries, a minimal operating-system filesystem, and default start command. Built in layers. Never changes once built.</dd>
<dt>Container</dt><dd>A <b>running (or stopped) instance of an image</b>, with a thin writable layer on top and its own network address, process list and filesystem view.</dd>
<dt>Registry</dt><dd>A server that stores and serves images, such as Docker Hub or a company registry. <code>docker pull</code> downloads, <code>docker push</code> uploads.</dd>
<dt>Tag</dt><dd>A label on an image version: <code>nginx:1.27</code>, <code>nk/poller:1.4</code>. If you omit the tag, Docker uses <code>latest</code>. <code>latest</code> is just a name that moves; in production always use an explicit version tag so you know what runs and can roll back.</dd>
<dt>Volume</dt><dd>Storage managed outside the container, so data survives when the container is deleted.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Registry image container relationship">
<rect x="15" y="60" width="140" height="60" rx="8" fill="#fed7aa"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="13">Registry</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">nk/poller:1.4</text>
<rect x="245" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="85" text-anchor="middle" class="svg-ink" font-size="13">Image (local)</text><text x="315" y="104" text-anchor="middle" class="svg-muted" font-size="11">read-only layers</text>
<rect x="475" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="50" text-anchor="middle" class="svg-ink" font-size="13">Container web-1</text>
<rect x="475" y="110" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="140" text-anchor="middle" class="svg-ink" font-size="13">Container web-2</text>
<line x1="155" y1="90" x2="245" y2="90" stroke="#64748b" stroke-width="2"/><text x="200" y="82" text-anchor="middle" class="svg-accent" font-size="12">pull</text>
<line x1="385" y1="80" x2="475" y2="45" stroke="#64748b" stroke-width="2"/><line x1="385" y1="100" x2="475" y2="135" stroke="#64748b" stroke-width="2"/><text x="440" y="100" text-anchor="middle" class="svg-accent" font-size="12">run</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">One image, many containers; deleting a container never changes the image</text>
</svg><p class="cap">Pull an image from a registry, run containers from it.</p></div>

<h3>Running a container: the commands you must know</h3>
<pre class="code"><span class="c"># download an image (run also does this automatically if missing)</span>
docker pull nginx:1.27
<span class="c"># start a container: -d detached, --name, -p HOST:CONTAINER, then the image</span>
docker run -d --name nk-web -p 8080:80 nginx
<span class="c"># list running containers; -a includes stopped ones</span>
docker ps
docker ps -a
<span class="c"># stop, start again, delete (a running one must be stopped first)</span>
docker stop nk-web
docker start nk-web
docker rm nk-web
<span class="c"># the images stored on this host</span>
docker images
<span class="c"># low-level details: IP address, port map, state</span>
docker inspect nk-web</pre>
<pre class="out">DOCK01&gt; docker run -d --name nk-web -p 8080:80 nginx
e8218d1400004f0c2b9d1e7a

DOCK01&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
e8218d140000   nginx      "nginx -g daemon of…"    Up 5 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     nk-web</pre>
<p>Read the PORTS column carefully: <code>0.0.0.0:8080-&gt;80/tcp</code> means "any address on the host, port 8080, forwards to port 80 inside the container". The host port is the left number. <b>Two containers cannot publish the same host port</b>; the second <code>docker run</code> fails with "port is already allocated". Several containers can share the same <i>container</i> port, because each container has its own address inside.</p>

<h3>Logs, exec and volumes (reference commands)</h3>
<p>The lab simulator covers the commands above. These three are part of the exam and every real deployment, so learn them as reference code (not run in the simulator):</p>
<pre class="code"><span class="c"># show what the app printed to stdout/stderr; -f follows, --tail limits</span>
docker logs nk-web
docker logs -f --tail 50 nk-web
<span class="c"># run a command inside a running container, e.g. an interactive shell</span>
docker exec -it nk-web sh
docker exec nk-web env
<span class="c"># named volume: data survives container deletion</span>
docker volume create inventory-data
docker run -d --name db -v inventory-data:/var/lib/data nk/inventory:2.0
<span class="c"># bind mount a host folder (handy for config files, read-only with :ro)</span>
docker run -d --name web -v /srv/site:/usr/share/nginx/html:ro -p 8080:80 nginx</pre>
<div class="eg"><p><b>Worked example.</b> A container writes a SQLite file inside itself. You delete and recreate the container and the file is gone, because the writable layer is deleted with the container. Mounting the volume <code>inventory-data</code> at the data path keeps the file across deletes and upgrades. Rule of thumb: <b>containers are disposable, volumes are not</b>.</p></div>

<div class="warn"><p><b>Common mistakes:</b> swapping the port order (<code>-p 80:8080</code> publishes host port 80, not 8080); expecting <code>docker ps</code> to show stopped containers (use <code>-a</code>); using <code>latest</code> in production; editing a running container by hand instead of building a new image.</p></div>
<div class="exam"><p><b>Exam trap:</b> an <b>image</b> is the template, a <b>container</b> is the running instance. <code>-p HOST:CONTAINER</code> (host first). <code>docker rm</code> removes a container; <code>docker rmi</code> removes an image. Containers share the host kernel.</p></div>

<div class="scn"><h4>Everything vanished after the upgrade</h4><p>A Nagpur team upgraded its small monitoring container by removing it and starting a new one. All saved dashboards were gone. The data lived in the container's own writable layer. They recreated it with a named volume mounted at the data path; the next upgrade lost nothing.</p><p><b>Lesson:</b> anything you cannot afford to lose belongs in a volume or a backing service, not in the container.</p></div>

<div class="iv"><p class="q">"What is the difference between an image and a container?"</p><p>An image is an immutable, layered template stored locally or in a registry; a container is a running or stopped instance created from it, with a thin writable layer. Add: many containers from one image, and tags version the images.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Image = read-only template; container = instance; registry stores images; tags version them.</li>
<li><code>docker run -d --name N -p HOST:CONT IMAGE</code>; check with <code>docker ps</code> (<code>-a</code> shows stopped).</li>
<li>Host ports are unique per host; a clash gives "port is already allocated".</li>
<li><code>docker logs</code> reads stdout, <code>docker exec</code> runs a command inside, volumes keep data.</li>
<li>Use explicit version tags in production, never rely on <code>latest</code>.</li>
</ul></div>
`,hi:`
<p>Recipe card aur pakaya hua khana alag cheezein hain. Card (<b>image</b>) ek read-only, share hone wala description hai jisme sab kuch hai: ingredients, steps, pan bhi. Har baar follow karne par aapko garam khana (<b>container</b>) milta hai. Ek card se dus khane bana sakte ho, aur khana phenkne se card kharab nahi hota. Docker woh kitchen hai jo cards padhta hai aur khana banata hai. Yeh chapter blueprint 4.6 hai; chapter 9 mein aapki apni Python app ka card banega.</p>

<h3>Vocabulary</h3>
<dl class="terms">
<dt>Image</dt><dd>Read-only package: app code, libraries, minimal operating-system filesystem aur default start command. Layers mein bana hota hai. Ek baar bana to kabhi nahi badalta.</dd>
<dt>Container</dt><dd>Image ka <b>running (ya stopped) instance</b>, upar patli writable layer ke saath, apna network address, process list aur filesystem view.</dd>
<dt>Registry</dt><dd>Server jo images store aur serve karta hai, jaise Docker Hub ya company registry. <code>docker pull</code> download karta hai, <code>docker push</code> upload.</dd>
<dt>Tag</dt><dd>Image version ka label: <code>nginx:1.27</code>, <code>nk/poller:1.4</code>. Tag na do to Docker <code>latest</code> use karta hai. <code>latest</code> bas ek naam hai jo khisakta rehta hai; production mein hamesha explicit version tag use karo taaki pata ho kya chal raha hai aur rollback ho sake.</dd>
<dt>Volume</dt><dd>Container ke bahar manage hone wali storage, taaki container delete hone par bhi data bacha rahe.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Registry image container ka rishta">
<rect x="15" y="60" width="140" height="60" rx="8" fill="#fed7aa"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="13">Registry</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">nk/poller:1.4</text>
<rect x="245" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="85" text-anchor="middle" class="svg-ink" font-size="13">Image (local)</text><text x="315" y="104" text-anchor="middle" class="svg-muted" font-size="11">read-only layers</text>
<rect x="475" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="50" text-anchor="middle" class="svg-ink" font-size="13">Container web-1</text>
<rect x="475" y="110" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="140" text-anchor="middle" class="svg-ink" font-size="13">Container web-2</text>
<line x1="155" y1="90" x2="245" y2="90" stroke="#64748b" stroke-width="2"/><text x="200" y="82" text-anchor="middle" class="svg-accent" font-size="12">pull</text>
<line x1="385" y1="80" x2="475" y2="45" stroke="#64748b" stroke-width="2"/><line x1="385" y1="100" x2="475" y2="135" stroke="#64748b" stroke-width="2"/><text x="440" y="100" text-anchor="middle" class="svg-accent" font-size="12">run</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Ek image, kai containers; container delete karne se image nahi badalti</text>
</svg><p class="cap">Registry se image pull karo, usse containers chalao.</p></div>

<h3>Container chalana: zaroori commands</h3>
<pre class="code"><span class="c"># image download (missing ho to run bhi apne aap karta hai)</span>
docker pull nginx:1.27
<span class="c"># container start: -d detached, --name, -p HOST:CONTAINER, phir image</span>
docker run -d --name nk-web -p 8080:80 nginx
<span class="c"># running containers list; -a mein stopped bhi</span>
docker ps
docker ps -a
<span class="c"># stop, dobara start, delete (running ko pehle stop karna padta hai)</span>
docker stop nk-web
docker start nk-web
docker rm nk-web
<span class="c"># is host par stored images</span>
docker images
<span class="c"># low-level details: IP address, port map, state</span>
docker inspect nk-web</pre>
<pre class="out">DOCK01&gt; docker run -d --name nk-web -p 8080:80 nginx
e8218d1400004f0c2b9d1e7a

DOCK01&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
e8218d140000   nginx      "nginx -g daemon of…"    Up 5 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     nk-web</pre>
<p>PORTS column dhyaan se padho: <code>0.0.0.0:8080-&gt;80/tcp</code> matlab "host ka koi bhi address, port 8080, container ke andar port 80 par forward hota hai". Host port left wala number hai. <b>Do containers same host port publish nahi kar sakte</b>; doosra <code>docker run</code> "port is already allocated" se fail hota hai. Kai containers same <i>container</i> port share kar sakte hain, kyunki har container ka andar apna address hai.</p>

<h3>Logs, exec aur volumes (reference commands)</h3>
<p>Lab simulator upar ke commands cover karta hai. Yeh teen exam aur har real deployment ka hissa hain, isliye inhe reference code ki tarah seekho (simulator mein nahi chalte):</p>
<pre class="code"><span class="c"># app ne stdout/stderr par kya print kiya; -f follow, --tail limit</span>
docker logs nk-web
docker logs -f --tail 50 nk-web
<span class="c"># chalte container ke andar command chalao, jaise interactive shell</span>
docker exec -it nk-web sh
docker exec nk-web env
<span class="c"># named volume: container delete hone par bhi data bachta hai</span>
docker volume create inventory-data
docker run -d --name db -v inventory-data:/var/lib/data nk/inventory:2.0
<span class="c"># host folder bind mount (config files ke liye, :ro se read-only)</span>
docker run -d --name web -v /srv/site:/usr/share/nginx/html:ro -p 8080:80 nginx</pre>
<div class="eg"><p><b>Worked example.</b> Ek container apne andar SQLite file likhta hai. Container delete karke dobara banao to file gayab, kyunki writable layer container ke saath delete hoti hai. Data path par volume <code>inventory-data</code> mount karne se file deletes aur upgrades ke beech bachti hai. Thumb rule: <b>containers disposable hain, volumes nahi</b>.</p></div>

<div class="warn"><p><b>Common mistakes:</b> port order ulta (<code>-p 80:8080</code> host port 80 publish karta hai, 8080 nahi); <code>docker ps</code> se stopped containers dikhne ki ummeed (<code>-a</code> use karo); production mein <code>latest</code>; running container ko haath se edit karna, nayi image build karne ki jagah.</p></div>
<div class="exam"><p><b>Exam trap:</b> <b>image</b> template hai, <b>container</b> running instance. <code>-p HOST:CONTAINER</code> (host pehle). <code>docker rm</code> container hataata hai; <code>docker rmi</code> image. Containers host kernel share karte hain.</p></div>

<div class="scn"><h4>Upgrade ke baad sab gayab</h4><p>Nagpur ki team ne apna chhota monitoring container remove karke naya start karke upgrade kiya. Saare saved dashboards gaye. Data container ki apni writable layer mein tha. Unhone use data path par named volume mount karke dobara banaya; agle upgrade mein kuch nahi khoya.</p><p><b>Lesson:</b> jo khona afford nahi kar sakte woh volume ya backing service mein rakho, container mein nahi.</p></div>

<div class="iv"><p class="q">"Image aur container mein kya farq hai?"</p><p>Image immutable, layered template hai jo local ya registry mein rehta hai; container usse bana running ya stopped instance hai, patli writable layer ke saath. Jodo: ek image se kai containers, aur tags images ko version karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Image = read-only template; container = instance; registry images store karti hai; tags unhe version karte hain.</li>
<li><code>docker run -d --name N -p HOST:CONT IMAGE</code>; <code>docker ps</code> se check (<code>-a</code> stopped dikhata hai).</li>
<li>Host ports har host par unique; clash par "port is already allocated".</li>
<li><code>docker logs</code> stdout padhta hai, <code>docker exec</code> andar command chalata hai, volumes data bachate hain.</li>
<li>Production mein explicit version tags, <code>latest</code> par bharosa nahi.</li>
</ul></div>
`}};export{e as default};