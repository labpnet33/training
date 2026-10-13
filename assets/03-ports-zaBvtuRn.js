var e={id:`ports`,h:{en:`Ports: publishing a container service and docker inspect`,hi:`Ports: container service publish karna aur docker inspect`},body:{en:`
<p>A container has its own private network address, so by default nobody outside the host can reach the service inside it. To let people in you <b>publish a port</b>. This chapter explains the <code>-p</code> option, what a port mapping looks like, and how to read <code>docker inspect</code>. Outputs are captured from the simulator's container engine.</p>

<h3>Analogy: an apartment building and the front desk</h3>
<p>Imagine an apartment building with one street address (the host). Inside are flats (containers), each with an internal flat number. A visitor cannot knock on a flat directly from the street. The front desk takes a rule: "visitors who ask for desk window 8080 are sent to flat web, door 80." That rule is a <b>port mapping</b>. The host's address is shared; the <b>host port</b> picks which container, and the <b>container port</b> is where the service really listens inside.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Port mapping 8080 to 80">
<rect x="15" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">Browser or script</text><text x="80" y="106" text-anchor="middle" class="svg-muted" font-size="11">on another machine</text>
<rect x="190" y="20" width="440" height="150" rx="12" fill="#e2e8f0"/><text x="410" y="42" text-anchor="middle" class="svg-ink" font-size="13">Host (server)</text>
<rect x="215" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="285" y="96" text-anchor="middle" class="svg-ink" font-size="13">Host port 8080</text><text x="285" y="114" text-anchor="middle" class="svg-muted" font-size="11">published</text>
<rect x="465" y="70" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="96" text-anchor="middle" class="svg-ink" font-size="13">Container web</text><text x="540" y="114" text-anchor="middle" class="svg-muted" font-size="11">listens on 80</text>
<line x1="145" y1="90" x2="215" y2="100" stroke="#64748b" stroke-width="2"/><line x1="355" y1="100" x2="465" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="410" y="92" text-anchor="middle" class="svg-accent" font-size="12">8080 to 80</text>
</svg><p class="cap">The host port is the front door; the container port is the flat.</p></div>

<h3>The -p option</h3>
<p>The format is <code>-p HOST_PORT:CONTAINER_PORT</code>. The left number is what the outside world uses; the right number is where the application listens inside the container. A web server image such as nginx listens on port 80 inside, so:</p>
<pre class="out">SRV1&gt; docker run -d --name web -p 8080:80 nginx
4e51737400004f0c2b9d1e7a

SRV1&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
4e5173740000   nginx      "nginx -g daemon of…"    Up 1 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     web</pre>
<p>Read the PORTS column: <code>0.0.0.0:8080-&gt;80/tcp</code> means "any address on the host, port 8080, goes to the container's TCP port 80". <code>0.0.0.0</code> means all of the host's interfaces. Users now browse to the host address with port 8080, while the web server itself still believes it is on port 80.</p>

<h3>Why map to a different port?</h3>
<ul>
<li>The host may already use port 80, or you may want several web containers on one host: web1 on 8081, web2 on 8082, all listening on 80 inside.</li>
<li>Ports below 1024 usually need extra privilege on the host; high ports avoid that.</li>
<li>Security: you publish only what must be reachable. A database used only by other containers needs <b>no</b> published port at all.</li>
</ul>

<h3>docker inspect: the full facts</h3>
<p><code>docker inspect NAME</code> prints details as JSON (module auto-formats). The simulator prints a short version with the most useful fields:</p>
<pre class="out">SRV1&gt; docker inspect web
[
  {
    "Id": "4e5173740000",
    "Name": "/web",
    "Image": "nginx",
    "State": { "Status": "running" },
    "NetworkSettings": {
      "Networks": { "bridge": { "Gateway": "172.17.0.1", <span class="hl">"IPAddress": "172.17.0.2"</span>, "IPPrefixLen": 16 } },
      "Ports": { "80/tcp": [ { "HostIp": "0.0.0.0", "HostPort": "8080" } ] }
    }
  }
]</pre>
<ul>
<li><code>State.Status</code> tells you running or exited.</li>
<li><code>IPAddress</code> is the container's private address on the default bridge network, 172.17.0.2 here (more in chapter 5).</li>
<li><code>Ports</code> lists the mapping: container port 80/tcp is published on host port 8080.</li>
</ul>
<p>A real engine prints many more fields, but these are the ones you read first. Inspect is also scriptable: a Python script can load the JSON and assert that a container is running, which fits the testing ideas of module auto-testing.</p>

<h3>When the host port is taken</h3>
<p>Only one thing can own a host port. If you try to publish 8080 a second time you get this real engine message:</p>
<pre class="out">SRV1&gt; docker run -d --name web2 -p 8080:80 nginx
docker: Error response from daemon: driver failed programming external connectivity: <span class="hl">Bind for 0.0.0.0:8080 failed: port is already allocated.</span></pre>
<p>The fix is to choose another host port (for example 8081:80) or stop the container that uses 8080.</p>

<div class="eg"><p><b>Worked example.</b> A dashboard container and a test-report container both listen on 80 inside. The engineer publishes them as 8080:80 and 8081:80. The outside world sees two services on one host, distinguished only by the host port.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Writing the numbers the wrong way round. <code>-p 80:8080</code> means host 80 to container 8080, which is wrong for a service that listens on 80. Remember: host first, container second. Another mistake is publishing a database port to the whole network when only a neighbouring container needs it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The mapping is HOST:CONTAINER. Also, publishing with -p opens the service to every interface; to limit to the host itself you bind to the loopback address (for example 127.0.0.1:8080:80 in a real engine).</p></div>

<div class="scn"><h4>The dashboard nobody could open</h4><p>An engineer started a dashboard container with <code>-p 80:8080</code>. Users got "connection refused" although the container was running. The dashboard really listened on port 80 inside, so traffic was being sent to container port 8080, where nothing listens. The correct mapping was <code>8080:80</code> (or <code>80:80</code>). The numbers had been copied from another service and swapped. Reading the PORTS column of docker ps and the Ports line of inspect took one minute.</p><p><b>Lesson:</b> know which port the application really listens on.</p></div>

<div class="iv"><p class="q">"What does docker run -p 8080:80 do?"</p><p>It publishes container port 80 on host port 8080, so traffic arriving at the host on 8080 is forwarded to the container's port 80. The host port is the external one, the container port is where the service listens. If the host port is already in use the run fails with a port already allocated error.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>-p HOST:CONTAINER publishes a container port on the host; host first.</li>
<li>0.0.0.0:8080-&gt;80/tcp in docker ps reads as host 8080 to container 80.</li>
<li>docker inspect gives state, private IP and port mappings as JSON.</li>
<li>One host port can have only one owner; choose another or stop the user.</li>
<li>Publish only what must be reachable.</li>
</ul></div>
`,hi:`
<p>Container ka apna private network address hota hai, isliye default mein host ke bahar koi bhi uske andar ki service tak nahi pahunch sakta. Logon ko andar aane dene ke liye aap <b>port publish</b> karte ho. Yeh chapter <code>-p</code> option, port mapping kaisi dikhti hai, aur <code>docker inspect</code> kaise padhein samjhata hai. Outputs simulator ke container engine se capture kiye gaye hain.</p>

<h3>Analogy: apartment building aur front desk</h3>
<p>Ek apartment building socho jiska ek street address hai (host). Andar flats (containers) hain, har ek ka internal flat number. Visitor street se seedha flat ka darwaza nahi khatkha sakta. Front desk ek rule rakhta hai: "jo visitor desk window 8080 maangta hai use flat web, darwaza 80 par bhejo." Woh rule <b>port mapping</b> hai. Host ka address shared hai; <b>host port</b> chunta hai kaunsa container, aur <b>container port</b> woh hai jahan service andar sach mein sunti hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Port mapping 8080 se 80">
<rect x="15" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">Browser ya script</text><text x="80" y="106" text-anchor="middle" class="svg-muted" font-size="11">doosri machine par</text>
<rect x="190" y="20" width="440" height="150" rx="12" fill="#e2e8f0"/><text x="410" y="42" text-anchor="middle" class="svg-ink" font-size="13">Host (server)</text>
<rect x="215" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="285" y="96" text-anchor="middle" class="svg-ink" font-size="13">Host port 8080</text><text x="285" y="114" text-anchor="middle" class="svg-muted" font-size="11">published</text>
<rect x="465" y="70" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="96" text-anchor="middle" class="svg-ink" font-size="13">Container web</text><text x="540" y="114" text-anchor="middle" class="svg-muted" font-size="11">80 par sunta hai</text>
<line x1="145" y1="90" x2="215" y2="100" stroke="#64748b" stroke-width="2"/><line x1="355" y1="100" x2="465" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="410" y="92" text-anchor="middle" class="svg-accent" font-size="12">8080 se 80</text>
</svg><p class="cap">Host port front door hai; container port flat hai.</p></div>

<h3>-p option</h3>
<p>Format <code>-p HOST_PORT:CONTAINER_PORT</code> hai. Baayen number woh hai jo bahar ki duniya use karti hai; daayen number woh hai jahan application container ke andar sunti hai. nginx jaisi web server image andar port 80 par sunti hai, isliye:</p>
<pre class="out">SRV1&gt; docker run -d --name web -p 8080:80 nginx
4e51737400004f0c2b9d1e7a

SRV1&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
4e5173740000   nginx      "nginx -g daemon of…"    Up 1 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     web</pre>
<p>PORTS column padho: <code>0.0.0.0:8080-&gt;80/tcp</code> ka matlab "host ka koi bhi address, port 8080, container ke TCP port 80 par jaata hai". <code>0.0.0.0</code> ka matlab host ke saare interfaces. Users ab host address aur port 8080 par browse karte hain, jabki web server khud abhi bhi sochta hai ki woh port 80 par hai.</p>

<h3>Alag port par map kyun karein?</h3>
<ul>
<li>Host par port 80 pehle se use ho sakta hai, ya aap ek host par kai web containers chahte ho: web1 8081 par, web2 8082 par, sab andar 80 par sunte hain.</li>
<li>1024 se neeche ke ports ke liye host par aam taur par extra privilege chahiye; high ports isse bachate hain.</li>
<li>Security: sirf wahi publish karo jo reachable hona chahiye. Jis database ko sirf doosre containers use karte hain use <b>koi</b> published port nahi chahiye.</li>
</ul>

<h3>docker inspect: poore facts</h3>
<p><code>docker inspect NAME</code> details JSON (module auto-formats) mein print karta hai. Simulator sabse kaam ke fields ka chhota version print karta hai:</p>
<pre class="out">SRV1&gt; docker inspect web
[
  {
    "Id": "4e5173740000",
    "Name": "/web",
    "Image": "nginx",
    "State": { "Status": "running" },
    "NetworkSettings": {
      "Networks": { "bridge": { "Gateway": "172.17.0.1", <span class="hl">"IPAddress": "172.17.0.2"</span>, "IPPrefixLen": 16 } },
      "Ports": { "80/tcp": [ { "HostIp": "0.0.0.0", "HostPort": "8080" } ] }
    }
  }
]</pre>
<ul>
<li><code>State.Status</code> batata hai running ya exited.</li>
<li><code>IPAddress</code> default bridge network par container ka private address hai, yahan 172.17.0.2 (chapter 5 mein aur).</li>
<li><code>Ports</code> mapping list karta hai: container port 80/tcp host port 8080 par published hai.</li>
</ul>
<p>Asli engine bahut zyada fields print karta hai, par yahi woh hain jo aap pehle padhte ho. Inspect scriptable bhi hai: Python script JSON load karke assert kar sakti hai ki container running hai, jo module auto-testing ke testing ideas se fit hota hai.</p>

<h3>Jab host port le liya gaya ho</h3>
<p>Host port ka sirf ek maalik ho sakta hai. 8080 ko doosri baar publish karne ki koshish karo to yeh real engine message milta hai:</p>
<pre class="out">SRV1&gt; docker run -d --name web2 -p 8080:80 nginx
docker: Error response from daemon: driver failed programming external connectivity: <span class="hl">Bind for 0.0.0.0:8080 failed: port is already allocated.</span></pre>
<p>Fix hai doosra host port chunna (jaise 8081:80) ya 8080 use karne wala container stop karna.</p>

<div class="eg"><p><b>Worked example.</b> Dashboard container aur test-report container dono andar 80 par sunte hain. Engineer unhe 8080:80 aur 8081:80 ke roop mein publish karta hai. Bahar ki duniya ek host par do services dekhti hai, jo sirf host port se alag hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Numbers ulte likhna. <code>-p 80:8080</code> ka matlab host 80 se container 8080, jo 80 par sunne wali service ke liye galat hai. Yaad rakho: pehle host, phir container. Ek aur galti: database port poore network ko publish karna jabki sirf padosi container ko chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mapping HOST:CONTAINER hai. Aur -p se publish karna service ko har interface par khol deta hai; sirf host tak seemit karne ke liye loopback address se bind karte hain (asli engine mein jaise 127.0.0.1:8080:80).</p></div>

<div class="scn"><h4>Dashboard jo koi khol nahi paya</h4><p>Ek engineer ne <code>-p 80:8080</code> ke saath dashboard container start kiya. Container running tha phir bhi users ko "connection refused" mila. Dashboard asal mein andar port 80 par sunta tha, isliye traffic container port 8080 par ja raha tha, jahan koi nahi sunta. Sahi mapping <code>8080:80</code> (ya <code>80:80</code>) thi. Numbers kisi aur service se copy hue aur ulte ho gaye the. docker ps ka PORTS column aur inspect ki Ports line padhne mein ek minute laga.</p><p><b>Lesson:</b> jaano application asal mein kaunse port par sunti hai.</p></div>

<div class="iv"><p class="q">"docker run -p 8080:80 kya karta hai?"</p><p>Woh container port 80 ko host port 8080 par publish karta hai, isliye host par 8080 par aane wala traffic container ke port 80 par forward hota hai. Host port external hai, container port woh jahan service sunti hai. Host port pehle se use mein ho to run port already allocated error ke saath fail hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>-p HOST:CONTAINER container port ko host par publish karta hai; pehle host.</li>
<li>docker ps mein 0.0.0.0:8080-&gt;80/tcp ka matlab host 8080 se container 80.</li>
<li>docker inspect state, private IP aur port mappings JSON mein deta hai.</li>
<li>Ek host port ka ek hi maalik; doosra chuno ya use karne wale ko stop karo.</li>
<li>Sirf wahi publish karo jo reachable hona chahiye.</li>
</ul></div>
`}};export{e as default};