var e={id:`start-stop-enable`,h:{en:`Controlling services: start, stop, restart, reload, enable`,hi:`Services control karna: start, stop, restart, reload, enable`},body:{en:`
<p>Now you act, not just look. Six verbs cover almost everything: <code>start</code>, <code>stop</code>, <code>restart</code>, <code>reload</code>, <code>enable</code>, <code>disable</code>. They all use the form <code>sudo systemctl VERB NAME</code> because they change the system. The best way to learn them is a maintenance drill with proof from another machine.</p>

<h3>The verbs</h3>
<table class="cmp"><thead><tr><th>Command</th><th>Effect now</th><th>Effect at boot</th></tr></thead><tbody>
<tr><td>start</td><td>Runs the service</td><td>none</td></tr>
<tr><td>stop</td><td>Stops the service</td><td>none</td></tr>
<tr><td>restart</td><td>Stop then start (brief outage)</td><td>none</td></tr>
<tr><td>reload</td><td>Re-read config, keep running</td><td>none</td></tr>
<tr><td>enable</td><td>none</td><td>Will start at boot</td></tr>
<tr><td>disable</td><td>none</td><td>Will not start at boot</td></tr>
</tbody></table>
<p>Memory trick: start and stop are about <b>now</b>; enable and disable are about <b>boot</b>. Add <code>--now</code> to enable or disable to do both at once.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Maintenance drill: curl works, stop nginx, curl fails, start nginx, curl works">
<rect x="10" y="40" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">curl works</text><text x="65" y="88" text-anchor="middle" class="svg-ink" font-size="12">page shown</text>
<rect x="135" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="12">systemctl</text><text x="190" y="88" text-anchor="middle" class="svg-ink" font-size="12">stop nginx</text>
<rect x="260" y="40" width="110" height="70" rx="8" fill="#fecaca"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="12">curl fails</text><text x="315" y="88" text-anchor="middle" class="svg-ink" font-size="12">port closed</text>
<rect x="385" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="12">systemctl</text><text x="440" y="88" text-anchor="middle" class="svg-ink" font-size="12">start nginx</text>
<rect x="510" y="40" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="570" y="70" text-anchor="middle" class="svg-ink" font-size="12">curl works</text><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="12">service back</text>
</svg><p class="cap">A maintenance drill, proved from the client WS01.</p></div>

<h3>The drill, from WS01</h3>
<p><code>curl</code> fetches a page from the command line. We run it on WS01 (the client) against NMS02's address.</p>
<pre class="out">priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>
<p>Now stop the service on NMS02 and try again from WS01:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl stop nginx</span>
netadmin@nms02:~$ <span class="hl">systemctl is-active nginx</span>
inactive

priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
curl: (7) Failed to connect to 10.99.0.20 port 80 after 1 ms: Couldn't connect to server</pre>
<p>The error is the same idea as "Connection refused" in the SSH module: the server is reachable, but nothing is listening on port 80. Note that <code>stop</code> printed nothing: on Linux, silence after a command usually means success. Start it again:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl start nginx</span>

priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>

<h3>restart or reload?</h3>
<p><b>restart</b> stops and starts the program, so connections drop for a moment. <b>reload</b> asks the program to re-read its configuration while it keeps serving, so there is no outage. Both are silent on success here:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl restart nginx</span>
netadmin@nms02:~$ <span class="hl">sudo systemctl reload nginx</span></pre>
<p>Use reload after a config change when the service supports it (as in the SSH module); use restart after upgrades or when reload does not apply the change.</p>

<h3>Boot behaviour: enable and disable</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl disable nginx</span>
Synchronizing state of nginx.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install disable nginx
Removed "/etc/systemd/system/multi-user.target.wants/nginx.service".
netadmin@nms02:~$ <span class="hl">systemctl is-enabled nginx</span>
disabled
netadmin@nms02:~$ <span class="hl">sudo systemctl enable nginx</span>
Synchronizing state of nginx.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable nginx
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.</pre>
<p>Enabling is a <b>symlink</b> (a shortcut file) placed in a folder that systemd reads at boot; disabling removes it. The words "Created symlink" and "Removed" tell you exactly what happened. Disabling did <b>not</b> stop nginx: it only changed the next boot.</p>

<h3>Reference (not run in the simulator)</h3>
<pre class="code">sudo systemctl enable --now nginx   <span class="c"># enable and start in one go</span>
sudo systemctl disable --now nginx  <span class="c"># disable and stop in one go</span>
sudo systemctl mask nginx           <span class="c"># block it from starting at all</span></pre>

<div class="eg"><p><b>Worked example.</b> Change window for NMS02: you tell the NOC, run <code>sudo systemctl stop nginx</code>, patch, run <code>sudo systemctl start nginx</code>, and prove it with <code>curl 10.99.0.20</code> from WS01, not from NMS02 itself. Proving from the client shows what users see.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Using <code>stop</code> on a production service during business hours "just to test". Always use <code>reload</code> if you only changed configuration, and announce outages in advance.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>start</code> does not enable; <code>enable</code> does not start. Only <code>enable --now</code> does both.</p></div>

<div class="scn"><h4>The reboot that proved nothing</h4><p>An engineer started a service and checked that it worked. After a power cut the next day it was dead. He had used <code>start</code> only. A colleague ran <code>sudo systemctl enable --now</code> and added a line to the checklist.</p><p><b>Lesson:</b> state the boot setting explicitly every time.</p></div>

<div class="iv"><p class="q">"What is the difference between restart and reload?"</p><p>Restart stops and starts the process, which interrupts connections briefly. Reload tells the running process to re-read its configuration without stopping, so users see no outage. I prefer reload for config changes when the service supports it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>start and stop affect now; enable and disable affect boot.</li>
<li>Silence after a systemctl command usually means success.</li>
<li>Reload avoids an outage; restart causes a short one.</li>
<li>Prove changes from a client, not only from the server.</li>
</ul></div>
`,hi:`
<p>Ab aap dekhte nahi, action lete ho. Chhe verbs lagbhag sab kuch cover karte hain: <code>start</code>, <code>stop</code>, <code>restart</code>, <code>reload</code>, <code>enable</code>, <code>disable</code>. Sab <code>sudo systemctl VERB NAME</code> form mein chalte hain kyunki system badalte hain. Seekhne ka sabse acha tareeka maintenance drill hai jisme doosri machine se saboot milta hai.</p>

<h3>Verbs</h3>
<table class="cmp"><thead><tr><th>Command</th><th>Abhi ka asar</th><th>Boot par asar</th></tr></thead><tbody>
<tr><td>start</td><td>Service chalata hai</td><td>koi nahi</td></tr>
<tr><td>stop</td><td>Service rokta hai</td><td>koi nahi</td></tr>
<tr><td>restart</td><td>Stop phir start (chhota outage)</td><td>koi nahi</td></tr>
<tr><td>reload</td><td>Config dobara padho, chalte raho</td><td>koi nahi</td></tr>
<tr><td>enable</td><td>koi nahi</td><td>Boot par start hogi</td></tr>
<tr><td>disable</td><td>koi nahi</td><td>Boot par start nahi hogi</td></tr>
</tbody></table>
<p>Yaad rakhne ka trick: start aur stop <b>abhi</b> ke liye; enable aur disable <b>boot</b> ke liye. Dono ek saath karne ke liye enable ya disable ke saath <code>--now</code> lagao.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Maintenance drill: curl chalta hai, nginx stop, curl fail, nginx start, curl chalta hai">
<rect x="10" y="40" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">curl chalta hai</text><text x="65" y="88" text-anchor="middle" class="svg-ink" font-size="12">page dikha</text>
<rect x="135" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="12">systemctl</text><text x="190" y="88" text-anchor="middle" class="svg-ink" font-size="12">stop nginx</text>
<rect x="260" y="40" width="110" height="70" rx="8" fill="#fecaca"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="12">curl fail</text><text x="315" y="88" text-anchor="middle" class="svg-ink" font-size="12">port band</text>
<rect x="385" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="12">systemctl</text><text x="440" y="88" text-anchor="middle" class="svg-ink" font-size="12">start nginx</text>
<rect x="510" y="40" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="570" y="70" text-anchor="middle" class="svg-ink" font-size="12">curl chalta hai</text><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="12">service wapas</text>
</svg><p class="cap">Maintenance drill, client WS01 se prove ki hui.</p></div>

<h3>WS01 se drill</h3>
<p><code>curl</code> command line se page laata hai. Hum ise WS01 (client) par NMS02 ke address ke against chalate hain.</p>
<pre class="out">priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>
<p>Ab NMS02 par service stop karo aur WS01 se dobara try karo:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl stop nginx</span>
netadmin@nms02:~$ <span class="hl">systemctl is-active nginx</span>
inactive

priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
curl: (7) Failed to connect to 10.99.0.20 port 80 after 1 ms: Couldn't connect to server</pre>
<p>Error wahi idea hai jo SSH module ke "Connection refused" mein tha: server reachable hai, par port 80 par koi nahi sun raha. Dhyan do <code>stop</code> ne kuch print nahi kiya: Linux mein command ke baad khamoshi aam taur par success hoti hai. Dobara start karo:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl start nginx</span>

priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>

<h3>restart ya reload?</h3>
<p><b>restart</b> program ko stop aur start karta hai, isliye connections ek pal ke liye gir jaate hain. <b>reload</b> program se config dobara padhne ko kehta hai jabki woh serve karta rehta hai, isliye outage nahi. Dono yahan success par khamosh hain:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl restart nginx</span>
netadmin@nms02:~$ <span class="hl">sudo systemctl reload nginx</span></pre>
<p>Config change ke baad reload use karo jab service support kare (jaise SSH module mein); upgrades ke baad ya reload change apply na kare tab restart.</p>

<h3>Boot behaviour: enable aur disable</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl disable nginx</span>
Synchronizing state of nginx.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install disable nginx
Removed "/etc/systemd/system/multi-user.target.wants/nginx.service".
netadmin@nms02:~$ <span class="hl">systemctl is-enabled nginx</span>
disabled
netadmin@nms02:~$ <span class="hl">sudo systemctl enable nginx</span>
Synchronizing state of nginx.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable nginx
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.</pre>
<p>Enable ek <b>symlink</b> (shortcut file) us folder mein rakhta hai jo systemd boot par padhta hai; disable use hata deta hai. "Created symlink" aur "Removed" shabd batate hain asal mein kya hua. Disable ne nginx ko stop <b>nahi</b> kiya: sirf agla boot badla.</p>

<h3>Reference (simulator mein nahi chalte)</h3>
<pre class="code">sudo systemctl enable --now nginx   <span class="c"># enable aur start ek saath</span>
sudo systemctl disable --now nginx  <span class="c"># disable aur stop ek saath</span>
sudo systemctl mask nginx           <span class="c"># start hone se hi rok do</span></pre>

<div class="eg"><p><b>Worked example.</b> NMS02 ki change window: NOC ko batao, <code>sudo systemctl stop nginx</code> chalao, patch karo, <code>sudo systemctl start nginx</code> chalao, aur NMS02 se nahi balki WS01 se <code>curl 10.99.0.20</code> chalakar prove karo. Client se prove karna dikhata hai users kya dekhte hain.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Business hours mein production service par "bas test ke liye" <code>stop</code> chalana. Sirf config badli ho to hamesha <code>reload</code> use karo, aur outages pehle se announce karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>start</code> enable nahi karta; <code>enable</code> start nahi karta. Sirf <code>enable --now</code> dono karta hai.</p></div>

<div class="scn"><h4>Reboot jisne kuch saabit nahi kiya</h4><p>Ek engineer ne service start ki aur check kiya ki chal rahi hai. Agle din power cut ke baad woh mari mili. Usne sirf <code>start</code> use kiya tha. Ek colleague ne <code>sudo systemctl enable --now</code> chalaya aur checklist mein ek line jodi.</p><p><b>Lesson:</b> boot setting har baar saaf-saaf batao.</p></div>

<div class="iv"><p class="q">"restart aur reload mein kya fark hai?"</p><p>Restart process ko stop aur start karta hai, jisse connections thodi der ke liye tootte hain. Reload chalte process ko config dobara padhne ko kehta hai bina roke, isliye users ko outage nahi dikhta. Config change ke liye jab service support kare main reload prefer karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>start aur stop abhi ko; enable aur disable boot ko.</li>
<li>systemctl command ke baad khamoshi aam taur par success hai.</li>
<li>Reload outage se bachata hai; restart chhota outage deta hai.</li>
<li>Changes client se prove karo, sirf server se nahi.</li>
</ul></div>
`}};export{e as default};