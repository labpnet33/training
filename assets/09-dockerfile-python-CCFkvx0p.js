var e={id:`dockerfile-python`,h:{en:`Containerising a Python app: Dockerfile, build and run`,hi:`Python app ko containerise karna: Dockerfile, build aur run`},body:{en:`
<p>A Dockerfile is a recipe card written line by line. Each line is one instruction, such as "start from this base kitchen", "bring these files in", "install these tools", "this is the door people knock on", "when you serve, run this". Docker follows the lines in order and freezes the result as an image. This is blueprint item 4.7: using Docker to create a container image for a Python app.</p>

<h3>The app</h3>
<p>A tiny status API for a branch site, using the Flask library. It reads its site name and port from environment variables (factors III and VII from chapter 3).</p>
<pre class="code"><span class="c"># app.py</span>
import os
from flask import Flask, jsonify

app = Flask(__name__)
SITE = os.environ.get("SITE_NAME", "unknown")

@app.route("/status")
def status():
    return jsonify(site=SITE, state="ok")

if __name__ == "__main__":
    <span class="c"># 0.0.0.0 = listen on all interfaces, required inside a container</span>
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))

<span class="c"># requirements.txt</span>
flask==3.0.3</pre>

<h3>The Dockerfile, instruction by instruction</h3>
<pre class="code"><span class="c"># Dockerfile</span>
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
ENV PORT=8080
EXPOSE 8080
CMD ["python", "app.py"]</pre>
<dl class="terms">
<dt>FROM</dt><dd>The <b>base image</b> you build on. <code>python:3.12-slim</code> is a small Debian with Python 3.12. Pin a version, never a bare <code>python</code>.</dd>
<dt>WORKDIR</dt><dd>Sets (and creates) the working directory for the next instructions and for the running app.</dd>
<dt>COPY</dt><dd>Copies files from your build folder into the image. <code>COPY requirements.txt .</code> puts the file into <code>/app</code>.</dd>
<dt>RUN</dt><dd>Runs a command <b>at build time</b> and saves the result as a layer, for example installing libraries.</dd>
<dt>ENV</dt><dd>Sets a default environment variable. Anyone can override it with <code>-e</code> at run time.</dd>
<dt>EXPOSE</dt><dd>Documents which port the app listens on. It does <b>not</b> publish the port; only <code>-p</code> at run time does.</dd>
<dt>CMD</dt><dd>The command that runs <b>when the container starts</b>. Use the list (exec) form, as shown. There is one CMD; <code>RUN</code> is for build time, <code>CMD</code> for run time.</dd>
</dl>

<h3>Why this order? Layer caching</h3>
<p>Every instruction makes a <b>layer</b>. Docker reuses a layer from cache if the instruction and everything before it are unchanged. You change <code>app.py</code> often but <code>requirements.txt</code> rarely, so copy and install the requirements <b>first</b>, and copy the code <b>last</b>. Then a code edit rebuilds only the last layer in a second, instead of reinstalling every library.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Image layers from Dockerfile">
<rect x="150" y="15" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">CMD and EXPOSE: metadata only</text>
<rect x="150" y="50" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">COPY app.py (changes often)</text>
<rect x="150" y="85" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">RUN pip install (cached unless requirements change)</text>
<rect x="150" y="120" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">COPY requirements.txt</text>
<rect x="150" y="155" width="340" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">FROM python:3.12-slim (base layers)</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Stable things at the bottom, fast-changing things on top</text>
</svg><p class="cap">Put rarely changing layers first so rebuilds stay fast.</p></div>

<h3>Build, run, check</h3>
<pre class="code"><span class="c"># build: -t name:tag, and the dot = build context (current folder)</span>
docker build -t nk/status-api:1.0 .
<span class="c"># run: publish host 8080 to container 8080, pass the site name</span>
docker run -d --name status -p 8080:8080 -e SITE_NAME=Pune nk/status-api:1.0
<span class="c"># check</span>
docker ps
docker logs status
curl h&#116;tp://localhost:8080/status</pre>
<pre class="out">$ docker ps
CONTAINER ID   IMAGE               COMMAND           STATUS         PORTS                    NAMES
3f9c1d2a7b10   nk/status-api:1.0   "python app.py"   Up 8 seconds   <span class="hl">0.0.0.0:8080-&gt;8080/tcp</span>   status

$ docker logs status
 * Serving Flask app 'app'
 * Running on all addresses (0.0.0.0)
 * Running on h&#116;tp://172.17.0.2:8080

$ curl h&#116;tp://localhost:8080/status
{"site":"Pune","state":"ok"}</pre>
<p>To share it, tag it for your registry and push: <code>docker tag nk/status-api:1.0 registry.example/netops/status-api:1.0</code> then <code>docker push registry.example/netops/status-api:1.0</code>. The pipeline from chapter 6 does exactly this on every commit.</p>
<div class="note"><p>The simulator does not run <code>docker build</code>, <code>logs</code> or <code>exec</code>, so everything in this chapter is reference code. The labs use <code>docker run</code>, <code>ps</code>, <code>stop</code>, <code>rm</code>, <code>images</code> and <code>inspect</code>.</p></div>

<div class="eg"><p><b>Worked example.</b> Add a <code>.dockerignore</code> file with <code>.git</code>, <code>__pycache__</code> and <code>.env</code>. It keeps the build context small and stops secrets from being copied into the image by <code>COPY . .</code>. Without it, a local <code>.env</code> with a token can end up inside an image you push to a registry.</p></div>

<div class="warn"><p><b>Common mistakes:</b> the app listens on <code>127.0.0.1</code> inside the container, so the published port gives "connection reset" (use <code>0.0.0.0</code>); thinking <code>EXPOSE</code> opens the port; copying the code before installing requirements, which kills caching; baking passwords in with <code>ENV</code> or <code>COPY</code>; forgetting the final dot in <code>docker build</code>.</p></div>
<div class="exam"><p><b>Exam trap:</b> <code>RUN</code> executes while <b>building</b>; <code>CMD</code> executes when the container <b>starts</b>. <code>EXPOSE</code> documents; <code>-p</code> publishes. The image is built once; containers are started from it.</p></div>

<div class="scn"><h4>Fast build, slow build</h4><p>A Surat team's image took four minutes to build on every commit because their Dockerfile ran <code>COPY . .</code> before <code>pip install</code>. Moving the requirements copy and install above the code copy dropped typical builds to six seconds, and the pipeline got noticeably cheaper.</p><p><b>Lesson:</b> order Dockerfile instructions from least to most frequently changed.</p></div>

<div class="iv"><p class="q">"Walk me through a Dockerfile for a Python app."</p><p>FROM a pinned slim Python image, WORKDIR, COPY requirements and RUN pip install, then COPY the code, set ENV defaults, EXPOSE the port, and CMD to start the app. Mention layer caching, binding to 0.0.0.0, and keeping secrets out of the image.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FROM, WORKDIR, COPY, RUN, EXPOSE, CMD are the core six; ENV sets defaults.</li>
<li><code>docker build -t name:tag .</code> makes the image; <code>docker run</code> starts a container from it.</li>
<li>Copy and install requirements before code so the cache works.</li>
<li>Listen on 0.0.0.0 and publish the port with <code>-p</code>.</li>
<li>Keep secrets out of the Dockerfile and use <code>.dockerignore</code>.</li>
</ul></div>
`,hi:`
<p>Dockerfile line-by-line likha recipe card hai. Har line ek instruction hai, jaise "is base kitchen se shuru karo", "yeh files andar lao", "yeh tools install karo", "yeh woh darwaza hai jis par log dastak dete hain", "serve karte waqt yeh chalao". Docker lines ko order mein follow karta hai aur result ko image ki tarah freeze kar deta hai. Yeh blueprint item 4.7 hai: Python app ke liye container image banane mein Docker use karna.</p>

<h3>App</h3>
<p>Branch site ke liye ek chhoti status API, Flask library ke saath. Yeh apna site name aur port environment variables se padhti hai (chapter 3 ke factors III aur VII).</p>
<pre class="code"><span class="c"># app.py</span>
import os
from flask import Flask, jsonify

app = Flask(__name__)
SITE = os.environ.get("SITE_NAME", "unknown")

@app.route("/status")
def status():
    return jsonify(site=SITE, state="ok")

if __name__ == "__main__":
    <span class="c"># 0.0.0.0 = saari interfaces par suno, container ke andar zaroori</span>
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))

<span class="c"># requirements.txt</span>
flask==3.0.3</pre>

<h3>Dockerfile, instruction ek-ek karke</h3>
<pre class="code"><span class="c"># Dockerfile</span>
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
ENV PORT=8080
EXPOSE 8080
CMD ["python", "app.py"]</pre>
<dl class="terms">
<dt>FROM</dt><dd>Woh <b>base image</b> jis par aap build karte ho. <code>python:3.12-slim</code> chhota Debian hai Python 3.12 ke saath. Version pin karo, sirf <code>python</code> kabhi nahi.</dd>
<dt>WORKDIR</dt><dd>Agle instructions aur chalti app ke liye working directory set (aur create) karta hai.</dd>
<dt>COPY</dt><dd>Aapke build folder se files image mein copy karta hai. <code>COPY requirements.txt .</code> file ko <code>/app</code> mein rakhta hai.</dd>
<dt>RUN</dt><dd>Command <b>build time par</b> chalata hai aur result layer ki tarah save karta hai, jaise libraries install karna.</dd>
<dt>ENV</dt><dd>Default environment variable set karta hai. Run time par koi bhi <code>-e</code> se override kar sakta hai.</dd>
<dt>EXPOSE</dt><dd>Document karta hai ki app kaunse port par sunti hai. Port <b>publish nahi</b> karta; sirf run time ka <code>-p</code> karta hai.</dd>
<dt>CMD</dt><dd>Woh command jo <b>container start hone par</b> chalti hai. List (exec) form use karo, jaisa dikhaya. CMD ek hi hoti hai; <code>RUN</code> build time ke liye, <code>CMD</code> run time ke liye.</dd>
</dl>

<h3>Yeh order kyun? Layer caching</h3>
<p>Har instruction ek <b>layer</b> banata hai. Docker cache se layer reuse karta hai agar instruction aur uske pehle ka sab kuch unchanged hai. <code>app.py</code> aap aksar badalte ho lekin <code>requirements.txt</code> kabhi-kabhi, isliye requirements ko <b>pehle</b> copy aur install karo, aur code <b>aakhir</b> mein copy karo. Phir code edit sirf aakhri layer ek second mein rebuild karta hai, har library dobara install nahi.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Dockerfile se image layers">
<rect x="150" y="15" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">CMD aur EXPOSE: sirf metadata</text>
<rect x="150" y="50" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">COPY app.py (aksar badalta hai)</text>
<rect x="150" y="85" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">RUN pip install (requirements na badle to cached)</text>
<rect x="150" y="120" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">COPY requirements.txt</text>
<rect x="150" y="155" width="340" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">FROM python:3.12-slim (base layers)</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Stable cheezein neeche, jaldi badalne wali upar</text>
</svg><p class="cap">Kam badalne wali layers pehle rakho taaki rebuild tez rahe.</p></div>

<h3>Build, run, check</h3>
<pre class="code"><span class="c"># build: -t name:tag, aur dot = build context (current folder)</span>
docker build -t nk/status-api:1.0 .
<span class="c"># run: host 8080 ko container 8080 se publish karo, site name pass karo</span>
docker run -d --name status -p 8080:8080 -e SITE_NAME=Pune nk/status-api:1.0
<span class="c"># check</span>
docker ps
docker logs status
curl h&#116;tp://localhost:8080/status</pre>
<pre class="out">$ docker ps
CONTAINER ID   IMAGE               COMMAND           STATUS         PORTS                    NAMES
3f9c1d2a7b10   nk/status-api:1.0   "python app.py"   Up 8 seconds   <span class="hl">0.0.0.0:8080-&gt;8080/tcp</span>   status

$ docker logs status
 * Serving Flask app 'app'
 * Running on all addresses (0.0.0.0)
 * Running on h&#116;tp://172.17.0.2:8080

$ curl h&#116;tp://localhost:8080/status
{"site":"Pune","state":"ok"}</pre>
<p>Share karne ke liye registry ke naam se tag karo aur push karo: <code>docker tag nk/status-api:1.0 registry.example/netops/status-api:1.0</code> phir <code>docker push registry.example/netops/status-api:1.0</code>. Chapter 6 ki pipeline har commit par yahi karti hai.</p>
<div class="note"><p>Simulator <code>docker build</code>, <code>logs</code> aur <code>exec</code> nahi chalata, isliye is chapter ka sab kuch reference code hai. Labs <code>docker run</code>, <code>ps</code>, <code>stop</code>, <code>rm</code>, <code>images</code> aur <code>inspect</code> use karte hain.</p></div>

<div class="eg"><p><b>Worked example.</b> <code>.dockerignore</code> file banao jisme <code>.git</code>, <code>__pycache__</code> aur <code>.env</code> ho. Isse build context chhota rehta hai aur <code>COPY . .</code> se secrets image mein copy nahi hote. Iske bina local <code>.env</code> mein rakha token us image mein pahunch sakta hai jo aap registry mein push karte ho.</p></div>

<div class="warn"><p><b>Common mistakes:</b> app container ke andar <code>127.0.0.1</code> par sunti hai, isliye published port "connection reset" deta hai (<code>0.0.0.0</code> use karo); <code>EXPOSE</code> ko port kholne wala samajhna; requirements install se pehle code copy karna, jisse caching khatam; <code>ENV</code> ya <code>COPY</code> se passwords bake karna; <code>docker build</code> mein aakhri dot bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap:</b> <code>RUN</code> <b>build</b> ke dauran chalta hai; <code>CMD</code> container <b>start</b> hone par. <code>EXPOSE</code> document karta hai; <code>-p</code> publish karta hai. Image ek baar banti hai; containers usse start hote hain.</p></div>

<div class="scn"><h4>Tez build, dheema build</h4><p>Surat ki ek team ki image har commit par chaar minute mein build hoti thi kyunki Dockerfile mein <code>pip install</code> se pehle <code>COPY . .</code> tha. Requirements ka copy aur install code copy se upar le jaane par typical builds chhe second par aa gaye, aur pipeline sasti ho gayi.</p><p><b>Lesson:</b> Dockerfile instructions ko kam se zyada badalne ke order mein rakho.</p></div>

<div class="iv"><p class="q">"Python app ke liye Dockerfile samjhao."</p><p>Pinned slim Python image se FROM, WORKDIR, requirements COPY aur RUN pip install, phir code COPY, ENV defaults, port EXPOSE, aur app start karne ke liye CMD. Layer caching, 0.0.0.0 par bind karna, aur secrets ko image se bahar rakhna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FROM, WORKDIR, COPY, RUN, EXPOSE, CMD core chhe; ENV defaults set karta hai.</li>
<li><code>docker build -t name:tag .</code> image banata hai; <code>docker run</code> usse container start karta hai.</li>
<li>Code se pehle requirements copy aur install karo taaki cache kaam kare.</li>
<li>0.0.0.0 par suno aur port <code>-p</code> se publish karo.</li>
<li>Secrets Dockerfile se bahar rakho aur <code>.dockerignore</code> use karo.</li>
</ul></div>
`}};export{e as default};