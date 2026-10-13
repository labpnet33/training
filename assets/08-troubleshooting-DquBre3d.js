var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the ladder from interface to port (Lab 1 and Lab 2)`,hi:`Troubleshooting workflow: interface se port tak ki seedhi (Lab 1 aur Lab 2)`},body:{en:`
<p>A good troubleshooter does not try commands at random. They climb a ladder, one rung at a time, and stop at the first rung that fails. You already did this with the OSI model on routers. On a Linux server the ladder has seven rungs, and each rung has one command.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Seven rung ladder: interface, address, route, gateway ping, destination ping, DNS, port">
<rect x="150" y="10" width="340" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up?  ip link</text>
<rect x="150" y="48" width="340" height="34" rx="6" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">2. Address and mask?  ip -br a</text>
<rect x="150" y="86" width="340" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">3. Route / default gateway?  ip route get</text>
<rect x="150" y="124" width="340" height="34" rx="6" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">4. Gateway answers?  ping -c 3 GW</text>
<rect x="150" y="162" width="340" height="34" rx="6" fill="#fed7aa"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="13">5. Destination by IP?  ping / tracepath</text>
<rect x="150" y="200" width="340" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">6. Name resolves?  getent / dig</text>
<rect x="150" y="238" width="340" height="34" rx="6" fill="#bae6fd"/><text x="320" y="260" text-anchor="middle" class="svg-ink" font-size="13">7. Port open?  nc -zv  and  ss -tlnp</text>
<text x="320" y="292" text-anchor="middle" class="svg-accent" font-size="12">stop at the first failing rung and fix it</text>
</svg><p class="cap">Climb the ladder; the first failure is the fault.</p></div>

<h3>What each failure points at</h3>
<table class="cmp"><tr><th>First failing rung</th><th>Evidence</th><th>Fix lives in</th></tr>
<tr><td>1-2 Interface or address</td><td>No inet line, wrong name, DOWN</td><td>netplan file or <code>ip link set up</code></td></tr>
<tr><td>3 Route</td><td>No default, "Network is unreachable"</td><td>netplan <code>routes</code></td></tr>
<tr><td>4 Gateway ping</td><td>Host Unreachable, ip neigh FAILED</td><td>VLAN, cable, switch port, gateway</td></tr>
<tr><td>5 Remote ping</td><td>Trace stops at a hop</td><td>The network beyond the gateway</td></tr>
<tr><td>6 DNS</td><td>IP works, names fail</td><td>netplan <code>nameservers</code>, DNS server</td></tr>
<tr><td>7 Port</td><td>Refused or timeout</td><td>The service, or a firewall</td></tr>
</table>

<h3>Lab 1 walked through: bring the new server online</h3>
<p><b>Rung 1 and 2.</b> <code>ip -br a</code> shows <code>eth0 UP</code> with no address, and <code>ip route</code> prints nothing. The interface name is <code>eth0</code>.</p>
<p><b>Quick fix.</b> <code>sudo ip addr add 10.30.0.10/24 dev eth0</code>; ping to the gateway answers. The NMS ping fails:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 3 10.10.0.10
<span class="hl">ping: connect: Network is unreachable</span></pre>
<p><b>Rung 3.</b> No default route. <code>sudo ip route add default via 10.30.0.1</code>, then <code>ping -c 3 10.10.0.10</code> and <code>tracepath 10.10.0.10</code> work (two hops).</p>
<p><b>Make it permanent.</b> <code>sudo cat /etc/netplan/50-cloud-init.yaml</code> shows the interface name <code>ens160</code> written by the installer. The real name is <code>eth0</code>. <code>sudo sed -i 's/ens160/eth0/' /etc/netplan/50-cloud-init.yaml</code> and <code>sudo netplan apply</code>. Finish with <code>ip -br a</code>, <code>ip route</code>, <code>cat /etc/resolv.conf</code>, <code>getent hosts nms.nk.lab</code> and <code>ping -c 2 nms.nk.lab</code>. The last ping prints <code>from nms.nk.lab (10.10.0.10)</code>.</p>

<h3>Lab 2 walked through: works by IP, not by name</h3>
<p>Ticket NK-2318 has three questions. The evidence for the first:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 2 10.10.0.10          <span class="c">(replies, rung 5 fine)</span>
netadmin@syslog02:~$ ping -c 2 nms.nk.lab
<span class="hl">ping: nms.nk.lab: Temporary failure in name resolution</span>
netadmin@syslog02:~$ cat /etc/resolv.conf
nameserver <span class="hl">10.30.0.53</span>
search nk.lab
netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.53
;; communications error to 10.30.0.53#53: timed out
;; no servers could be reached</pre>
<p>Rung 6 is the first failure. Ask the real DNS server directly with <code>nslookup nms.nk.lab 10.30.0.1</code>; it answers 10.10.0.10. The fix: <code>sudo sed -i 's/10.30.0.53/10.30.0.1/' /etc/netplan/50-cloud-init.yaml</code> then <code>sudo netplan apply</code>, then verify with <code>dig +short nms.nk.lab</code> and a ping by name. <code>core-sw</code> (10.30.0.2) is not in DNS, so add a local line to <code>/etc/hosts</code> with <code>tee -a</code>.</p>
<p><b>Rung 7.</b> <code>nc -zv nms.nk.lab 80</code> succeeds; <code>nc -zv nms.nk.lab 8080</code> gives <code>Connection refused</code>. To double-check from the other side: <code>ssh netadmin@nms.nk.lab</code>, then <code>sudo ss -tlnp</code> shows <code>nginx</code> on <code>0.0.0.0:80</code> and nothing on 8080.</p>

<h3>A note before you change anything</h3>
<ul>
<li>Write down what the server looked like before you touched it (<code>ip -br a</code>, <code>ip route</code>).</li>
<li>Prefer temporary <code>ip</code> commands to test an idea; write the permanent fix in netplan once you are sure.</li>
<li>On a remote server use <code>netplan try</code> so a mistake rolls itself back.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A colleague says "the new server is broken". You climb the ladder in two minutes: interface up, address present, default route present, gateway pings, remote IP pings, name fails. Rung 6. You never touched firewalls or switches, and the fix is one line in netplan.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Jumping to the top of the ladder (restart the service, blame the firewall) before checking the bottom. Most "server problems" are rung 2 or 3.</p></div>
<div class="exam"><p><b>Exam trap.</b> The best answer in an interview is a method, not a command. Name the order (interface, address, route, gateway, destination, DNS, port) and say what each failure points to.</p></div>

<div class="scn"><h4>Three tickets, one root cause</h4><p>Monday brought three tickets: backups failing, monitoring blind, and a web app unable to send mail. All three servers were in the same new VLAN. The engineer ran the ladder on the first server and found rung 3 failing: <code>ip route get</code> showed "Network is unreachable". The VLAN template had no gateway. Fixing one netplan template and re-applying it closed all three tickets.</p><p><b>Lesson:</b> the ladder finds the layer; the layer often explains many tickets at once.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a Linux server that has no network connectivity."</p><p>I climb from the bottom: <code>ip link</code> for the interface, <code>ip -br a</code> for the address, <code>ip route get</code> for the gateway, ping the gateway, ping the destination, test DNS with <code>getent</code> or <code>dig</code>, then test the port with <code>nc</code> and <code>ss</code>. I fix the first failing layer, make it permanent in netplan, and verify again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the seven-rung ladder and stop at the first failure.</li>
<li>Fix temporarily with <code>ip</code> to test, then permanently in netplan.</li>
<li>"Network is unreachable" is rung 3; "Temporary failure in name resolution" is rung 6.</li>
<li>Connection refused and timed out at rung 7 point to different owners (service versus network).</li>
<li>Record the state before and after your change.</li>
</ul></div>
`,hi:`
<p>Achha troubleshooter random commands nahi try karta. Woh seedhi chadhta hai, ek rung ek baar, aur pehle fail hone wale rung par ruk jaata hai. Routers par aap yahi OSI model ke saath karte aaye ho. Linux server par seedhi ke saat rungs hain, aur har rung ka ek command.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Saat rungs ki seedhi: interface, address, route, gateway ping, destination ping, DNS, port">
<rect x="150" y="10" width="340" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up?  ip link</text>
<rect x="150" y="48" width="340" height="34" rx="6" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">2. Address aur mask?  ip -br a</text>
<rect x="150" y="86" width="340" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">3. Route / default gateway?  ip route get</text>
<rect x="150" y="124" width="340" height="34" rx="6" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">4. Gateway jawab deta hai?  ping -c 3 GW</text>
<rect x="150" y="162" width="340" height="34" rx="6" fill="#fed7aa"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="13">5. Destination IP se?  ping / tracepath</text>
<rect x="150" y="200" width="340" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">6. Naam resolve hota hai?  getent / dig</text>
<rect x="150" y="238" width="340" height="34" rx="6" fill="#bae6fd"/><text x="320" y="260" text-anchor="middle" class="svg-ink" font-size="13">7. Port open?  nc -zv  aur  ss -tlnp</text>
<text x="320" y="292" text-anchor="middle" class="svg-accent" font-size="12">pehle fail hone wale rung par ruko aur theek karo</text>
</svg><p class="cap">Seedhi chadho; pehla failure hi fault hai.</p></div>

<h3>Har failure kis taraf ishara karta hai</h3>
<table class="cmp"><tr><th>Pehla failing rung</th><th>Saboot</th><th>Fix kahan</th></tr>
<tr><td>1-2 Interface ya address</td><td>inet line nahi, galat naam, DOWN</td><td>netplan file ya <code>ip link set up</code></td></tr>
<tr><td>3 Route</td><td>Default nahi, "Network is unreachable"</td><td>netplan <code>routes</code></td></tr>
<tr><td>4 Gateway ping</td><td>Host Unreachable, ip neigh FAILED</td><td>VLAN, cable, switch port, gateway</td></tr>
<tr><td>5 Remote ping</td><td>Trace kisi hop par rukta hai</td><td>Gateway ke aage ka network</td></tr>
<tr><td>6 DNS</td><td>IP chalta hai, names fail</td><td>netplan <code>nameservers</code>, DNS server</td></tr>
<tr><td>7 Port</td><td>Refused ya timeout</td><td>Service, ya firewall</td></tr>
</table>

<h3>Lab 1 ek-ek step: naye server ko online lao</h3>
<p><b>Rung 1 aur 2.</b> <code>ip -br a</code> <code>eth0 UP</code> bina address ke dikhata hai, aur <code>ip route</code> kuch print nahi karta. Interface ka naam <code>eth0</code> hai.</p>
<p><b>Quick fix.</b> <code>sudo ip addr add 10.30.0.10/24 dev eth0</code>; gateway ka ping jawab deta hai. NMS ka ping fail:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 3 10.10.0.10
<span class="hl">ping: connect: Network is unreachable</span></pre>
<p><b>Rung 3.</b> Default route nahi. <code>sudo ip route add default via 10.30.0.1</code>, phir <code>ping -c 3 10.10.0.10</code> aur <code>tracepath 10.10.0.10</code> chalte hain (do hops).</p>
<p><b>Permanent banao.</b> <code>sudo cat /etc/netplan/50-cloud-init.yaml</code> installer ka likha interface name <code>ens160</code> dikhata hai. Asli naam <code>eth0</code> hai. <code>sudo sed -i 's/ens160/eth0/' /etc/netplan/50-cloud-init.yaml</code> aur <code>sudo netplan apply</code>. Aakhir mein <code>ip -br a</code>, <code>ip route</code>, <code>cat /etc/resolv.conf</code>, <code>getent hosts nms.nk.lab</code> aur <code>ping -c 2 nms.nk.lab</code>. Aakhri ping <code>from nms.nk.lab (10.10.0.10)</code> print karta hai.</p>

<h3>Lab 2 ek-ek step: IP se chalta hai, naam se nahi</h3>
<p>Ticket NK-2318 mein teen sawaal hain. Pehle ka saboot:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 2 10.10.0.10          <span class="c">(replies, rung 5 theek)</span>
netadmin@syslog02:~$ ping -c 2 nms.nk.lab
<span class="hl">ping: nms.nk.lab: Temporary failure in name resolution</span>
netadmin@syslog02:~$ cat /etc/resolv.conf
nameserver <span class="hl">10.30.0.53</span>
search nk.lab
netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.53
;; communications error to 10.30.0.53#53: timed out
;; no servers could be reached</pre>
<p>Rung 6 pehla failure hai. Asli DNS server se seedha poocho <code>nslookup nms.nk.lab 10.30.0.1</code>; woh 10.10.0.10 deta hai. Fix: <code>sudo sed -i 's/10.30.0.53/10.30.0.1/' /etc/netplan/50-cloud-init.yaml</code> phir <code>sudo netplan apply</code>, phir <code>dig +short nms.nk.lab</code> aur naam se ping se verify. <code>core-sw</code> (10.30.0.2) DNS mein nahi hai, isliye <code>tee -a</code> se <code>/etc/hosts</code> mein local line jodo.</p>
<p><b>Rung 7.</b> <code>nc -zv nms.nk.lab 80</code> succeed; <code>nc -zv nms.nk.lab 8080</code> <code>Connection refused</code> deta hai. Doosri taraf se double-check: <code>ssh netadmin@nms.nk.lab</code>, phir <code>sudo ss -tlnp</code> <code>nginx</code> ko <code>0.0.0.0:80</code> par dikhata hai aur 8080 par kuch nahi.</p>

<h3>Kuch badalne se pehle ek note</h3>
<ul>
<li>Haath lagane se pehle likh lo server pehle kaisa dikhta tha (<code>ip -br a</code>, <code>ip route</code>).</li>
<li>Idea test karne ke liye temporary <code>ip</code> commands pasand karo; pakka hone par permanent fix netplan mein likho.</li>
<li>Remote server par <code>netplan try</code> use karo taaki galti apne aap rollback ho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai "naya server kharab hai". Aap do minute mein seedhi chadhte ho: interface up, address hai, default route hai, gateway ping hota hai, remote IP ping hota hai, naam fail. Rung 6. Aapne firewalls ya switches ko haath nahi lagaya, aur fix netplan mein ek line hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Neeche check kiye bina seedhi ke upar kood jaana (service restart karo, firewall ko blame karo). Zyadatar "server problems" rung 2 ya 3 hoti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interview mein best jawab ek method hota hai, command nahi. Order batao (interface, address, route, gateway, destination, DNS, port) aur kaho ki har failure kis taraf ishara karta hai.</p></div>

<div class="scn"><h4>Teen tickets, ek root cause</h4><p>Monday ko teen tickets aaye: backups fail, monitoring andhi, aur web app mail nahi bhej pa raha. Teeno servers ek hi naye VLAN mein the. Engineer ne pehle server par seedhi chalayi aur rung 3 fail paya: <code>ip route get</code> ne "Network is unreachable" dikhaya. VLAN template mein gateway tha hi nahi. Ek netplan template theek karke dobara apply karne se teeno tickets band ho gaye.</p><p><b>Lesson:</b> seedhi layer dhoondhti hai; layer aksar ek saath kai tickets samjha deti hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao jis Linux server ki network connectivity nahi hai use kaise troubleshoot karte ho."</p><p>Main neeche se chadhta hoon: interface ke liye <code>ip link</code>, address ke liye <code>ip -br a</code>, gateway ke liye <code>ip route get</code>, gateway ping, destination ping, <code>getent</code> ya <code>dig</code> se DNS, phir <code>nc</code> aur <code>ss</code> se port test. Pehla failing layer fix karta hoon, netplan mein permanent karta hoon, aur dobara verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat-rung seedhi use karo aur pehle failure par ruko.</li>
<li>Test ke liye <code>ip</code> se temporary fix, phir netplan mein permanent.</li>
<li>"Network is unreachable" rung 3 hai; "Temporary failure in name resolution" rung 6.</li>
<li>Rung 7 par Connection refused aur timed out alag owners (service versus network) dikhate hain.</li>
<li>Change se pehle aur baad ki state record karo.</li>
</ul></div>
`}};export{e as default};