var e={id:`images-containers`,h:{en:`Images and containers: docker run, docker ps and docker images`,hi:`Images aur containers: docker run, docker ps aur docker images`},body:{en:`
<p>This chapter has one idea: an <b>image</b> is a recipe and a <b>container</b> is a dish cooked from it. You will start your first containers and read the three commands you will use every day: <code>docker run</code>, <code>docker ps</code> and <code>docker images</code>. The outputs below were captured from the simulator's container engine on a server host called SRV1.</p>

<h3>Analogy: a recipe and a meal</h3>
<p>A recipe card is written once and never changes. From one card you can cook one meal or twenty. Each meal is separate: spilling soup on one does not affect another. The recipe card is the <b>image</b>. Each cooked meal is a <b>container</b>. The shelf where recipe cards are stored and shared is the <b>registry</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="One image, many containers">
<rect x="15" y="25" width="150" height="55" rx="10" fill="#e2e8f0"/><text x="90" y="50" text-anchor="middle" class="svg-ink" font-size="13">Registry</text><text x="90" y="68" text-anchor="middle" class="svg-muted" font-size="11">stores images</text>
<rect x="15" y="100" width="150" height="55" rx="10" fill="#fde68a"/><text x="90" y="125" text-anchor="middle" class="svg-ink" font-size="13">Image: nginx</text><text x="90" y="143" text-anchor="middle" class="svg-muted" font-size="11">read-only recipe</text>
<line x1="90" y1="80" x2="90" y2="100" stroke="#64748b" stroke-width="2"/><text x="140" y="94" class="svg-accent" font-size="11">pull</text>
<rect x="300" y="15" width="150" height="45" rx="10" fill="#bbf7d0"/><text x="375" y="43" text-anchor="middle" class="svg-ink" font-size="13">Container web</text>
<rect x="300" y="70" width="150" height="45" rx="10" fill="#bbf7d0"/><text x="375" y="98" text-anchor="middle" class="svg-ink" font-size="13">Container web2</text>
<rect x="300" y="125" width="150" height="40" rx="10" fill="#bbf7d0"/><text x="375" y="150" text-anchor="middle" class="svg-ink" font-size="13">Container web3</text>
<line x1="165" y1="127" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><line x1="165" y1="127" x2="300" y2="92" stroke="#64748b" stroke-width="2"/><line x1="165" y1="127" x2="300" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="540" y="100" text-anchor="middle" class="svg-muted" font-size="12">one image, many containers</text>
</svg><p class="cap">An image can start any number of containers.</p></div>

<h3>Starting a container</h3>
<pre class="out">SRV1&gt; docker run -d --name web -p 8080:80 nginx
4e51737400004f0c2b9d1e7a</pre>
<p>Read it piece by piece:</p>
<ul>
<li><code>docker run</code> means "create a container from an image and start it".</li>
<li><code>-d</code> means <b>detached</b>: run in the background and give me my prompt back. Without it the container would take over your terminal.</li>
<li><code>--name web</code> gives the container a name you choose. Without a name Docker invents a random one, which is hard to remember.</li>
<li><code>-p 8080:80</code> publishes a port (chapter 3).</li>
<li><code>nginx</code> is the image name: a popular web server.</li>
<li>The long string printed back is the new container's <b>ID</b>. Your ID will be different.</li>
</ul>

<h3>Where do images come from?</h3>
<p>If the image is not on the host, the engine downloads (<b>pulls</b>) it from a registry first. This is what you see when you start an image for the first time:</p>
<pre class="out">SRV1&gt; docker run -d --name api python
Unable to find image 'python:latest' locally
latest: Pulling from library/python
Status: Downloaded newer image for python:latest
3985773300004f0c2b9d1e7a</pre>
<p>Notice <code>python:latest</code>. An image name has the form <code>name:tag</code>. The <b>tag</b> is usually a version. If you leave the tag out you get <code>latest</code>, which means "whatever the publisher marked newest today". That is convenient for learning and risky for production, because tomorrow's <code>latest</code> may be different. Pin a version tag in real work.</p>

<h3>Listing containers and images</h3>
<pre class="out">SRV1&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
4e5173740000   nginx      "nginx -g daemon of…"    Up 1 seconds        0.0.0.0:8080-&gt;80/tcp     web
398577330000   python     "/entrypoint.sh""        Up 1 seconds                                 api

SRV1&gt; docker images
REPOSITORY   TAG       IMAGE ID       SIZE
nginx        latest    e635ffcc0000   69MB
python       latest    a38a065a0000   127MB</pre>
<ul>
<li><code>docker ps</code> lists <b>running</b> containers: ID, which image, the command it runs, how long it has been up, published ports and its name.</li>
<li><code>docker images</code> lists images stored on this host with tag and size. Two containers from one image share the same stored image, which is why containers cost so little disk space.</li>
</ul>
<p>The simulator shows a fixed "Up 1 seconds"; a real engine shows the true uptime, and its columns differ slightly in width.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net wants a web page for test results. The engineer runs <code>docker run -d --name web -p 8080:80 nginx</code>, checks with <code>docker ps</code> that STATUS says Up and PORTS shows 8080, and gives colleagues the host address and port 8080. Total time: under a minute, and the host needed no web server installation.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting <code>-d</code> and then closing the terminal, which stops the container. Another is confusing the container ID (a hex string) with the image ID; the first column of <code>docker ps</code> is the container.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>docker ps</code> shows only running containers; <code>docker ps -a</code> shows stopped ones too (chapter 4). And an image tag of latest is not a guarantee of anything stable.</p></div>

<div class="scn"><h4>Latest changed overnight</h4><p>A team's automation container used the image tag latest. One morning their test runner failed because the base image had moved to a new major version of Python overnight. They changed to a pinned tag, rebuilt, and recorded the tag in the pipeline. Failures from surprise updates ended.</p><p><b>Lesson:</b> pin tags in anything that must be repeatable.</p></div>

<div class="iv"><p class="q">"What is the difference between a Docker image and a container?"</p><p>An image is a read-only template containing the application and its dependencies; a container is a running or stopped instance created from an image, with its own writable layer, process and network settings. Many containers can be created from one image. Add that images come from registries and are identified by name and tag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>docker run creates and starts a container from an image; -d runs it in the background.</li>
<li>--name gives a friendly name; the printed string is the container ID.</li>
<li>Missing images are pulled from a registry; names look like name:tag.</li>
<li>docker ps lists running containers; docker images lists stored images.</li>
<li>Pin version tags for repeatable work; latest is a moving target.</li>
</ul></div>
`,hi:`
<p>Is chapter ka ek hi idea hai: <b>image</b> recipe hai aur <b>container</b> usse pakaya hua khana. Aap apne pehle containers start karoge aur woh teen commands padhoge jo roz use honge: <code>docker run</code>, <code>docker ps</code> aur <code>docker images</code>. Neeche ke outputs simulator ke container engine se SRV1 naam ke server host par capture kiye gaye hain.</p>

<h3>Analogy: recipe aur khana</h3>
<p>Recipe card ek baar likhi jaati hai aur badalti nahi. Ek card se aap ek khana ya bees khane bana sakte ho. Har khana alag hai: ek par soup girane se doosre par asar nahi. Recipe card <b>image</b> hai. Har pakaya hua khana <b>container</b> hai. Woh shelf jahan recipe cards store aur share hoti hain <b>registry</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek image, kai containers">
<rect x="15" y="25" width="150" height="55" rx="10" fill="#e2e8f0"/><text x="90" y="50" text-anchor="middle" class="svg-ink" font-size="13">Registry</text><text x="90" y="68" text-anchor="middle" class="svg-muted" font-size="11">images store karti hai</text>
<rect x="15" y="100" width="150" height="55" rx="10" fill="#fde68a"/><text x="90" y="125" text-anchor="middle" class="svg-ink" font-size="13">Image: nginx</text><text x="90" y="143" text-anchor="middle" class="svg-muted" font-size="11">read-only recipe</text>
<line x1="90" y1="80" x2="90" y2="100" stroke="#64748b" stroke-width="2"/><text x="140" y="94" class="svg-accent" font-size="11">pull</text>
<rect x="300" y="15" width="150" height="45" rx="10" fill="#bbf7d0"/><text x="375" y="43" text-anchor="middle" class="svg-ink" font-size="13">Container web</text>
<rect x="300" y="70" width="150" height="45" rx="10" fill="#bbf7d0"/><text x="375" y="98" text-anchor="middle" class="svg-ink" font-size="13">Container web2</text>
<rect x="300" y="125" width="150" height="40" rx="10" fill="#bbf7d0"/><text x="375" y="150" text-anchor="middle" class="svg-ink" font-size="13">Container web3</text>
<line x1="165" y1="127" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><line x1="165" y1="127" x2="300" y2="92" stroke="#64748b" stroke-width="2"/><line x1="165" y1="127" x2="300" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="540" y="100" text-anchor="middle" class="svg-muted" font-size="12">ek image, kai containers</text>
</svg><p class="cap">Ek image kitne bhi containers start kar sakti hai.</p></div>

<h3>Container start karna</h3>
<pre class="out">SRV1&gt; docker run -d --name web -p 8080:80 nginx
4e51737400004f0c2b9d1e7a</pre>
<p>Tukda-tukda padho:</p>
<ul>
<li><code>docker run</code> ka matlab "image se container banao aur start karo".</li>
<li><code>-d</code> ka matlab <b>detached</b>: background mein chalo aur mera prompt wapas do. Iske bina container aapka terminal le leta.</li>
<li><code>--name web</code> container ko aapka chuna naam deta hai. Naam ke bina Docker random naam banata hai, jo yaad rakhna mushkil hai.</li>
<li><code>-p 8080:80</code> ek port publish karta hai (chapter 3).</li>
<li><code>nginx</code> image ka naam hai: ek popular web server.</li>
<li>Wapas print hui lambi string naye container ki <b>ID</b> hai. Aapki ID alag hogi.</li>
</ul>

<h3>Images kahan se aati hain?</h3>
<p>Image host par na ho to engine pehle use registry se download (<b>pull</b>) karta hai. Image pehli baar start karne par yahi dikhta hai:</p>
<pre class="out">SRV1&gt; docker run -d --name api python
Unable to find image 'python:latest' locally
latest: Pulling from library/python
Status: Downloaded newer image for python:latest
3985773300004f0c2b9d1e7a</pre>
<p><code>python:latest</code> dekho. Image ka naam <code>name:tag</code> form mein hota hai. <b>Tag</b> aam taur par version hota hai. Tag chhodo to <code>latest</code> milta hai, jiska matlab "publisher ne aaj jise sabse naya mark kiya". Seekhne ke liye convenient hai aur production ke liye risky, kyunki kal ka <code>latest</code> alag ho sakta hai. Real kaam mein version tag pin karo.</p>

<h3>Containers aur images ki list</h3>
<pre class="out">SRV1&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
4e5173740000   nginx      "nginx -g daemon of…"    Up 1 seconds        0.0.0.0:8080-&gt;80/tcp     web
398577330000   python     "/entrypoint.sh""        Up 1 seconds                                 api

SRV1&gt; docker images
REPOSITORY   TAG       IMAGE ID       SIZE
nginx        latest    e635ffcc0000   69MB
python       latest    a38a065a0000   127MB</pre>
<ul>
<li><code>docker ps</code> <b>running</b> containers list karta hai: ID, kaunsi image, woh kaunsa command chala raha hai, kitni der se up hai, published ports aur naam.</li>
<li><code>docker images</code> is host par stored images tag aur size ke saath list karta hai. Ek image ke do containers wahi stored image share karte hain, isliye containers disk bahut kam lete hain.</li>
</ul>
<p>Simulator fixed "Up 1 seconds" dikhata hai; asli engine sahi uptime dikhata hai, aur uske columns ki chaudai thodi alag hoti hai.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net ko test results ka web page chahiye. Engineer <code>docker run -d --name web -p 8080:80 nginx</code> chalata hai, <code>docker ps</code> se check karta hai ki STATUS mein Up hai aur PORTS mein 8080 dikhta hai, aur colleagues ko host address aur port 8080 deta hai. Kul samay: ek minute se kam, aur host par web server install nahi karna pada.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> <code>-d</code> bhool jaana aur phir terminal band kar dena, jisse container ruk jaata hai. Ek aur: container ID (hex string) ko image ID se confuse karna; <code>docker ps</code> ka pehla column container ka hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>docker ps</code> sirf running containers dikhata hai; <code>docker ps -a</code> stopped wale bhi dikhata hai (chapter 4). Aur latest image tag kisi stable cheez ki guarantee nahi hai.</p></div>

<div class="scn"><h4>Latest raat bhar mein badal gaya</h4><p>Ek team ka automation container latest image tag use karta tha. Ek subah unka test runner fail hua kyunki base image raat bhar mein Python ke naye major version par chali gayi thi. Unhone pinned tag par switch kiya, rebuild kiya aur tag pipeline mein record kiya. Surprise updates se failures khatam hue.</p><p><b>Lesson:</b> jo repeatable hona chahiye usme tags pin karo.</p></div>

<div class="iv"><p class="q">"Docker image aur container mein kya farak hai?"</p><p>Image read-only template hai jisme application aur uski dependencies hain; container image se bana running ya stopped instance hai, apni writable layer, process aur network settings ke saath. Ek image se kai containers ban sakte hain. Jodo ki images registries se aati hain aur naam aur tag se pehchani jaati hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>docker run image se container banata aur start karta hai; -d background mein chalata hai.</li>
<li>--name friendly naam deta hai; print hui string container ID hai.</li>
<li>Missing images registry se pull hoti hain; naam name:tag jaise hote hain.</li>
<li>docker ps running containers list karta hai; docker images stored images.</li>
<li>Repeatable kaam ke liye version tags pin karo; latest badalta rehta hai.</li>
</ul></div>
`}};export{e as default};