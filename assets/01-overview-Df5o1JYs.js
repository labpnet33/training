var e={id:`overview`,h:{en:`Services: what you will learn and the big picture`,hi:`Services: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> A Linux server is useful because of the programs that keep running in the background: a web server, an SSH server, a scheduler. These are called <b>services</b> (or daemons). You will install one (nginx), control it with <code>systemctl</code>, check which port it uses, read its logs with <code>journalctl</code>, schedule a job with cron, and finish by fixing a ticket where a service had failed.</p>
<p><b>Prerequisites.</b> You should know how to log in to a Linux server and run commands (earlier modules), and what a TCP port is. Every new command is explained when it appears.</p>

<h3>Analogy: the shop and its staff</h3>
<p>Imagine a shop. The building is the server. The cashier, the security guard and the cleaner are services: people who keep working even when no customer is talking to them. A manager (<b>systemd</b>) hires them in the morning, notices if one does not turn up, and can send one home. <code>systemctl</code> is how you speak to that manager.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology: workstation WS01 and server NMS02 connected through switch SW1 on 10.99.0.0/24">
<rect x="20" y="70" width="140" height="70" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">WS01</text><text x="90" y="120" text-anchor="middle" class="svg-ink" font-size="11">Priya's workstation</text>
<rect x="250" y="70" width="140" height="70" rx="8" fill="#fde68a"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="11">switch</text>
<rect x="480" y="50" width="150" height="110" rx="8" fill="#bbf7d0"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="13">NMS02 10.99.0.20</text><text x="555" y="104" text-anchor="middle" class="svg-ink" font-size="11">nginx (80)</text><text x="555" y="122" text-anchor="middle" class="svg-ink" font-size="11">ssh (22)</text><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="11">cron</text>
<line x1="160" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The lab: NMS02 runs the services; WS01 is the client that tests them.</p></div>

<h3>What a service is, in plain words</h3>
<p>A normal command, like <code>ls</code>, runs and ends. A service starts, then <b>keeps running</b> and waits for requests. nginx waits for web requests on port 80. sshd waits for logins on port 22. cron waits for the clock. Because they never "finish", you need tools to ask three questions: is it running, will it start after a reboot, and why did it stop?</p>

<h3>The first look</h3>
<p><code>systemctl list-units --type=service</code> lists the services systemd knows. We read it as: <b>LOAD</b> (was the definition found), <b>ACTIVE</b> (running or not) and <b>SUB</b> (detail).</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl list-units --type=service</span>
  UNIT                         LOAD   ACTIVE   SUB     DESCRIPTION
  systemd-journald.service     loaded active   running Journal Service
  systemd-resolved.service     loaded active   running Network Name Resolution
  ssh.service                  loaded active   running OpenBSD Secure Shell server
  rsyslog.service              loaded active   running System Logging Service
  cron.service                 loaded active   running Regular background program processing daemon

5 loaded units listed.</pre>
<p>Every service name ends in <code>.service</code>; you may leave that suffix off, so <code>ssh</code> and <code>ssh.service</code> mean the same.</p>

<h3>Network engineer connection</h3>
<p>Think of a router. IOS runs processes such as the SSH server and the NTP client. When a router stops answering, you check whether the process is alive. A Linux monitoring server is the same: if the NMS web page is down, you check the service first, not the cable.</p>

<div class="eg"><p><b>Worked example.</b> The NOC dashboard on NMS02 will not open. In 30 seconds you ask: is nginx active, is port 80 listening, and what does the log say? This module teaches exactly those three checks.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Editing a configuration file and expecting the change to apply immediately. A running service reads its configuration when it starts or reloads, not continuously.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Active" and "enabled" are different. Active means running now; enabled means it starts at boot.</p></div>

<div class="scn"><h4>The page that vanished at 2 am</h4><p>A server rebooted after patching and the status page was gone in the morning. The service had been started by hand a month ago and never enabled, so it did not return after the reboot. One command would have prevented the whole incident.</p><p><b>Lesson:</b> start it now and enable it for the next boot.</p></div>

<div class="iv"><p class="q">"What is a service or daemon in Linux, and what manages it?"</p><p>A service is a program that runs in the background waiting for work, such as a web or SSH server. On modern Ubuntu, systemd starts, stops and monitors services, and <code>systemctl</code> is the command used to control them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A service keeps running and waits for requests.</li>
<li>systemd manages services; <code>systemctl</code> is your control.</li>
<li>Three questions: running now, running after reboot, why did it stop.</li>
<li>Names end in <code>.service</code>; the suffix is optional.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Linux server isliye kaam ka hota hai kyunki background mein chalne wale programs hote hain: web server, SSH server, scheduler. Inhe <b>services</b> (ya daemons) kehte hain. Aap ek (nginx) install karoge, <code>systemctl</code> se control karoge, dekhoge woh kaunsa port use karta hai, <code>journalctl</code> se uske logs padhoge, cron se job schedule karoge, aur ant mein ek ticket fix karoge jahan service fail ho gayi thi.</p>
<p><b>Prerequisites.</b> Aapko Linux server mein login karna aur commands chalana (pehle ke modules) aur TCP port kya hota hai yeh aana chahiye. Har naya command aate hi samjhaya gaya hai.</p>

<h3>Analogy: dukaan aur uska staff</h3>
<p>Ek dukaan socho. Building server hai. Cashier, security guard aur safai wala services hain: aise log jo customer baat na kare tab bhi kaam karte rehte hain. Ek manager (<b>systemd</b>) subah unhe bulata hai, dekhta hai koi na aaye, aur kisi ko ghar bhej sakta hai. <code>systemctl</code> us manager se baat karne ka tareeka hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology: workstation WS01 aur server NMS02 switch SW1 se 10.99.0.0/24 par jude hain">
<rect x="20" y="70" width="140" height="70" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">WS01</text><text x="90" y="120" text-anchor="middle" class="svg-ink" font-size="11">Priya ka workstation</text>
<rect x="250" y="70" width="140" height="70" rx="8" fill="#fde68a"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="11">switch</text>
<rect x="480" y="50" width="150" height="110" rx="8" fill="#bbf7d0"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="13">NMS02 10.99.0.20</text><text x="555" y="104" text-anchor="middle" class="svg-ink" font-size="11">nginx (80)</text><text x="555" y="122" text-anchor="middle" class="svg-ink" font-size="11">ssh (22)</text><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="11">cron</text>
<line x1="160" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab: NMS02 services chalata hai; WS01 client hai jo unhe test karta hai.</p></div>

<h3>Service seedhe shabdon mein</h3>
<p>Normal command, jaise <code>ls</code>, chalta hai aur khatam hota hai. Service shuru hoti hai, phir <b>chalti rehti hai</b> aur requests ka intezaar karti hai. nginx port 80 par web requests ka intezaar karta hai. sshd port 22 par logins ka. cron ghadi ka. Kyunki yeh kabhi "khatam" nahi hoti, tools chahiye jo teen sawaal pooch sakein: abhi chal rahi hai, reboot ke baad shuru hogi, aur kyun ruki.</p>

<h3>Pehli nazar</h3>
<p><code>systemctl list-units --type=service</code> woh services list karta hai jo systemd jaanta hai. Padhne ka tareeka: <b>LOAD</b> (definition mili ya nahi), <b>ACTIVE</b> (chal rahi hai ya nahi) aur <b>SUB</b> (detail).</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl list-units --type=service</span>
  UNIT                         LOAD   ACTIVE   SUB     DESCRIPTION
  systemd-journald.service     loaded active   running Journal Service
  systemd-resolved.service     loaded active   running Network Name Resolution
  ssh.service                  loaded active   running OpenBSD Secure Shell server
  rsyslog.service              loaded active   running System Logging Service
  cron.service                 loaded active   running Regular background program processing daemon

5 loaded units listed.</pre>
<p>Har service ka naam <code>.service</code> par khatam hota hai; yeh suffix chhod sakte ho, isliye <code>ssh</code> aur <code>ssh.service</code> ek hi hain.</p>

<h3>Network engineer se connection</h3>
<p>Router socho. IOS mein SSH server aur NTP client jaise processes chalte hain. Router jawab dena band kare to dekhte ho process zinda hai ya nahi. Linux monitoring server bhi waisa hi hai: NMS web page down ho to pehle service dekho, cable nahi.</p>

<div class="eg"><p><b>Worked example.</b> NMS02 par NOC dashboard nahi khul raha. 30 second mein aap pooochte ho: nginx active hai, port 80 sun raha hai, aur log kya kehta hai? Yeh module bilkul yehi teen checks sikhata hai.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Configuration file badalkar umeed karna ki change turant lag jayega. Chalti service config start ya reload par padhti hai, lagataar nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Active" aur "enabled" alag hain. Active matlab abhi chal rahi; enabled matlab boot par shuru hoti hai.</p></div>

<div class="scn"><h4>Woh page jo raat 2 baje gayab ho gaya</h4><p>Patching ke baad server reboot hua aur subah status page gayab tha. Service ek mahine pehle haath se start ki gayi thi aur kabhi enable nahi hui, isliye reboot ke baad wapas nahi aayi. Ek command poora incident rok deta.</p><p><b>Lesson:</b> abhi start karo aur agle boot ke liye enable bhi karo.</p></div>

<div class="iv"><p class="q">"Linux mein service ya daemon kya hai, aur use kaun manage karta hai?"</p><p>Service ek program hai jo background mein kaam ke intezaar mein chalta hai, jaise web ya SSH server. Modern Ubuntu par systemd services ko start, stop aur monitor karta hai, aur <code>systemctl</code> unhe control karne ka command hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service chalti rehti hai aur requests ka intezaar karti hai.</li>
<li>systemd manage karta hai; <code>systemctl</code> aapka control hai.</li>
<li>Teen sawaal: abhi chal rahi, reboot ke baad, kyun ruki.</li>
<li>Naam <code>.service</code> par khatam; suffix optional hai.</li>
</ul></div>
`}};export{e as default};