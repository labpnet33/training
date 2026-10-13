var e={id:`ha-links`,h:{en:`The HA links: HA1, HA2, backups and what travels on each`,hi:`HA links: HA1, HA2, backups aur har link par kya jaata hai`},body:{en:`
<p>Two firewalls need to talk to each other all the time. They do it over dedicated <b>HA links</b>. Think of two air traffic controllers working a shared radar room: one wire carries their conversation, another carries the copy of every flight plan. If you understand which wire carries what, every HA symptom becomes easier to read.</p>

<h3>HA1: the control link</h3>
<p><b>HA1</b> is the control link. It carries:</p>
<ul>
<li><b>Hello messages</b>, which prove the peer software is alive (default hello interval 8000 ms).</li>
<li><b>Heartbeats</b>, which prove the peer is reachable (default heartbeat interval 1000 ms).</li>
<li><b>HA state information</b> and <b>user-ID or routing-related state</b> that the peers share.</li>
<li><b>Configuration synchronisation</b>, so a commit on one firewall can be pushed to the other.</li>
</ul>
<p>HA1 needs an IP address on each firewall, in a small subnet such as 10.99.0.0/30. On hardware with dedicated HA ports (for example ports named HA1 and HA2), use them. On smaller hardware or virtual firewalls you may assign a data port to the HA role. The management port can also act as HA1 or as the HA1 backup, which is common in small designs, but remember that the management network then becomes part of the HA path.</p>
<p>Clear-text HA1 uses TCP ports 28769 and 28260. If you enable <b>HA1 encryption</b> (needs the HA keys exported from one firewall and imported into the other), the control traffic uses TCP port 28. Encryption is strongly recommended whenever HA1 crosses any network you do not fully control.</p>

<h3>HA1 backup and heartbeat backup</h3>
<p>If the HA1 link dies but the firewalls cannot tell whether the peer died or only the cable, a wrong decision is dangerous. In active/passive it could make both firewalls think they are active (a <b>split brain</b>, with duplicate IP addresses on the wire). To prevent that, PAN-OS supports:</p>
<ul>
<li><b>HA1 backup</b>: a second control link on its own interface and subnet. Control traffic moves to it if the primary HA1 fails.</li>
<li><b>Heartbeat backup</b>: a simple ping-style heartbeat sent through the management ports, used only to decide whether the peer is still alive.</li>
</ul>
<p>Use both when you can. A dedicated HA1 plus a management-port heartbeat backup is a very common and sound design.</p>

<h3>HA2: the data link</h3>
<p><b>HA2</b> carries <b>session synchronisation</b>: every new session, update and expiry the active firewall knows about. It also carries HA2 keep-alives so each side knows the data link is healthy. The transport choices are:</p>
<table class="cmp"><tr><th>HA2 transport</th><th>When used</th></tr>
<tr><td>Ethernet (default)</td><td>Firewalls directly cabled or in the same Layer 2 segment. Lowest overhead.</td></tr>
<tr><td>IP</td><td>Firewalls separated by a Layer 3 hop. Uses IP protocol 99.</td></tr>
<tr><td>UDP</td><td>Where IP protocol 99 is blocked. Uses UDP port 29281.</td></tr>
</table>
<p>An <b>HA2 backup</b> link is also possible and recommended for session-heavy networks. Without session sync on HA2 the failover still works, but existing connections are dropped and users must reconnect.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="HA link types">
<rect x="20" y="40" width="130" height="110" rx="10" fill="#bbf7d0"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="14">FW-A</text><text x="85" y="115" text-anchor="middle" class="svg-muted" font-size="12">HA1 10.99.0.1</text><text x="85" y="133" text-anchor="middle" class="svg-muted" font-size="12">HA2 10.99.1.1</text>
<rect x="490" y="40" width="130" height="110" rx="10" fill="#e2e8f0"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="14">FW-B</text><text x="555" y="115" text-anchor="middle" class="svg-muted" font-size="12">HA1 10.99.0.2</text><text x="555" y="133" text-anchor="middle" class="svg-muted" font-size="12">HA2 10.99.1.2</text>
<line x1="150" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/><text x="320" y="58" text-anchor="middle" class="svg-accent" font-size="12">HA1 (control)</text>
<line x1="150" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">HA2 (sessions)</text>
<line x1="150" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">HA1 backup</text>
<line x1="150" y1="145" x2="490" y2="145" stroke="#64748b" stroke-width="1" stroke-dasharray="2 4"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">heartbeat backup via management ports</text>
</svg><p class="cap">Example addressing used in this module. Documentation of private lab ranges only.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>The simulator does not model HA links, so this is for reading only. Check each command with the <code>?</code> help on a real firewall because syntax varies slightly between PAN-OS releases.</p>
<pre class="code"><span class="c"># FW-A: HA1 and HA2 interface addressing</span>
set deviceconfig high-availability interface ha1 port ha1-a ip-address 10.99.0.1 netmask 255.255.255.252
set deviceconfig high-availability interface ha2 port ha2-a ip-address 10.99.1.1 netmask 255.255.255.252
<span class="c"># FW-B mirrors it with .2 addresses</span>
set deviceconfig high-availability interface ha1 port ha1-a ip-address 10.99.0.2 netmask 255.255.255.252
set deviceconfig high-availability interface ha2 port ha2-a ip-address 10.99.1.2 netmask 255.255.255.252</pre>

<div class="eg"><p><b>Worked example.</b> A branch firewall pair is two metres apart. The engineer cables HA1 and HA2 directly with short cables, uses Ethernet transport for HA2 and sets the management port as heartbeat backup. If someone unplugs the HA1 cable, the heartbeat backup over management still says the peer is alive, so the passive unit stays passive instead of splitting the brain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running HA1 or HA2 through a normal switch shared with user VLANs. Congestion or a spanning-tree event on that switch can look like a peer failure. Use direct cables or isolated links.</p></div>
<div class="exam"><p><b>Exam trap.</b> HA1 is control and configuration; HA2 is session state. Do not mix them up. HA2 uses Ethernet by default, with IP protocol 99 or UDP 29281 as alternatives.</p></div>

<div class="scn"><h4>Both firewalls claimed to be active</h4><p>After a switch maintenance window, a customer saw random packet loss. Both firewalls in the pair showed themselves as active. HA1 ran over a shared access switch that was reloaded, and there was no backup link and no heartbeat backup, so each unit thought the other had died and both answered ARP for the same addresses. Rebuilding HA1 as a direct cable, and adding the management heartbeat backup, fixed it.</p><p><b>Lesson:</b> design HA links so one failure cannot isolate the peers while both are healthy.</p></div>

<div class="iv"><p class="q">"What traffic does HA1 carry and what does HA2 carry?"</p><p>HA1 is the control link: hello, heartbeat, state and configuration sync, TCP 28769 and 28260 in clear text or TCP 28 encrypted. HA2 carries session synchronisation using Ethernet, IP protocol 99 or UDP 29281. Add that backups exist for HA1, a heartbeat backup uses the management port, and that sensible designs avoid shared switches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA1 is control, hello, heartbeat and config sync; HA2 is session sync.</li>
<li>Defaults: hello 8000 ms and heartbeat 1000 ms.</li>
<li>Encrypt HA1 if it crosses any shared path.</li>
<li>Add an HA1 backup and heartbeat backup to avoid split brain.</li>
<li>HA2 transport: Ethernet, IP (protocol 99) or UDP (29281).</li>
</ul></div>
`,hi:`
<p>Do firewalls ko aapas mein hamesha baat karni padti hai. Woh yeh dedicated <b>HA links</b> par karte hain. Aise socho jaise do air traffic controllers ek shared radar room mein kaam karte hain: ek wire unki baatcheet le jaati hai, doosri har flight plan ki copy. Agar aap samajh lo ki kaun si wire kya le jaati hai, to har HA symptom padhna aasaan ho jaata hai.</p>

<h3>HA1: control link</h3>
<p><b>HA1</b> control link hai. Yeh le jaata hai:</p>
<ul>
<li><b>Hello messages</b>, jo prove karte hain ki peer ka software zinda hai (default hello interval 8000 ms).</li>
<li><b>Heartbeats</b>, jo prove karte hain ki peer reachable hai (default heartbeat interval 1000 ms).</li>
<li><b>HA state information</b> aur peers ke share kiye <b>user-ID ya routing se jude state</b>.</li>
<li><b>Configuration synchronisation</b>, taaki ek firewall par commit doosre par push ho sake.</li>
</ul>
<p>HA1 ko har firewall par ek IP address chahiye, chhote subnet mein jaise 10.99.0.0/30. Jin hardware par dedicated HA ports hain (jaise HA1 aur HA2 naam ke ports) unhe use karo. Chhote hardware ya virtual firewalls par aap data port ko HA role de sakte ho. Management port bhi HA1 ya HA1 backup ban sakta hai, jo chhote designs mein common hai, lekin yaad rakho ki tab management network HA path ka hissa ban jaata hai.</p>
<p>Clear-text HA1 TCP ports 28769 aur 28260 use karta hai. Agar aap <b>HA1 encryption</b> enable karte ho (ek firewall se HA keys export karke doosre mein import karni padti hain), to control traffic TCP port 28 use karta hai. Jahan bhi HA1 aise network se guzre jo aapke poore control mein nahi, encryption strongly recommended hai.</p>

<h3>HA1 backup aur heartbeat backup</h3>
<p>Agar HA1 link mar jaaye lekin firewalls ko pata na chale ki peer mara ya sirf cable, to galat decision khatarnak hai. Active/passive mein dono firewalls sochne lagte hain ki woh active hain (<b>split brain</b>, wire par duplicate IP addresses). Isse bachne ke liye PAN-OS support karta hai:</p>
<ul>
<li><b>HA1 backup</b>: apne interface aur subnet par doosra control link. Primary HA1 fail ho to control traffic isme chala jaata hai.</li>
<li><b>Heartbeat backup</b>: management ports se bheja gaya simple ping-type heartbeat, jo sirf yeh decide karne ke liye hai ki peer zinda hai ya nahi.</li>
</ul>
<p>Jahan ho sake dono use karo. Dedicated HA1 plus management-port heartbeat backup bahut common aur sahi design hai.</p>

<h3>HA2: data link</h3>
<p><b>HA2</b> <b>session synchronisation</b> le jaata hai: active firewall ko pata har naya session, update aur expiry. Yeh HA2 keep-alives bhi le jaata hai taaki har side ko data link ki health pata rahe. Transport ke options:</p>
<table class="cmp"><tr><th>HA2 transport</th><th>Kab use hota hai</th></tr>
<tr><td>Ethernet (default)</td><td>Firewalls directly cabled ya same Layer 2 segment mein. Sabse kam overhead.</td></tr>
<tr><td>IP</td><td>Firewalls ke beech Layer 3 hop ho. IP protocol 99 use karta hai.</td></tr>
<tr><td>UDP</td><td>Jahan IP protocol 99 blocked ho. UDP port 29281 use karta hai.</td></tr>
</table>
<p><b>HA2 backup</b> link bhi possible hai aur session-heavy networks ke liye recommended hai. HA2 par session sync ke bina failover chalta hai, lekin maujooda connections gir jaate hain aur users ko dobara connect karna padta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="HA link types">
<rect x="20" y="40" width="130" height="110" rx="10" fill="#bbf7d0"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="14">FW-A</text><text x="85" y="115" text-anchor="middle" class="svg-muted" font-size="12">HA1 10.99.0.1</text><text x="85" y="133" text-anchor="middle" class="svg-muted" font-size="12">HA2 10.99.1.1</text>
<rect x="490" y="40" width="130" height="110" rx="10" fill="#e2e8f0"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="14">FW-B</text><text x="555" y="115" text-anchor="middle" class="svg-muted" font-size="12">HA1 10.99.0.2</text><text x="555" y="133" text-anchor="middle" class="svg-muted" font-size="12">HA2 10.99.1.2</text>
<line x1="150" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/><text x="320" y="58" text-anchor="middle" class="svg-accent" font-size="12">HA1 (control)</text>
<line x1="150" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">HA2 (sessions)</text>
<line x1="150" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">HA1 backup</text>
<line x1="150" y1="145" x2="490" y2="145" stroke="#64748b" stroke-width="1" stroke-dasharray="2 4"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">heartbeat backup management ports se</text>
</svg><p class="cap">Is module mein use hone wali example addressing. Sirf documentation ya private lab ranges.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Simulator HA links ko model nahi karta, isliye yeh sirf padhne ke liye hai. Asli firewall par har command ko <code>?</code> help se check karo kyunki PAN-OS releases ke beech syntax thoda alag ho sakta hai.</p>
<pre class="code"><span class="c"># FW-A: HA1 aur HA2 interface addressing</span>
set deviceconfig high-availability interface ha1 port ha1-a ip-address 10.99.0.1 netmask 255.255.255.252
set deviceconfig high-availability interface ha2 port ha2-a ip-address 10.99.1.1 netmask 255.255.255.252
<span class="c"># FW-B same banata hai, .2 addresses ke saath</span>
set deviceconfig high-availability interface ha1 port ha1-a ip-address 10.99.0.2 netmask 255.255.255.252
set deviceconfig high-availability interface ha2 port ha2-a ip-address 10.99.1.2 netmask 255.255.255.252</pre>

<div class="eg"><p><b>Worked example.</b> Ek branch firewall pair do metre door hai. Engineer HA1 aur HA2 ko chhoti cables se directly jodta hai, HA2 ke liye Ethernet transport use karta hai aur management port ko heartbeat backup banata hai. Agar koi HA1 cable nikaal de, to management par heartbeat backup phir bhi batata hai ki peer zinda hai, isliye passive unit passive hi rehta hai aur split brain nahi hota.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> HA1 ya HA2 ko user VLANs wale normal shared switch se chalana. Us switch par congestion ya spanning-tree event peer failure jaisa dikh sakta hai. Direct cables ya isolated links use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> HA1 control aur configuration hai; HA2 session state hai. Dono ko mix mat karo. HA2 default Ethernet use karta hai, alternatives IP protocol 99 ya UDP 29281 hain.</p></div>

<div class="scn"><h4>Dono firewalls ne khud ko active maana</h4><p>Switch maintenance window ke baad ek customer ko random packet loss dikha. Pair ke dono firewalls khud ko active dikha rahe the. HA1 ek shared access switch par chal raha tha jo reload hua, aur na backup link tha na heartbeat backup, isliye har unit ne socha ki doosra mar gaya aur dono same addresses ke liye ARP ka jawab dene lage. HA1 ko direct cable bana kar aur management heartbeat backup jodkar fix hua.</p><p><b>Lesson:</b> HA links aise design karo ki ek failure se dono healthy peers ek doosre se kat na jaayein.</p></div>

<div class="iv"><p class="q">"HA1 kya carry karta hai aur HA2 kya?"</p><p>HA1 control link hai: hello, heartbeat, state aur configuration sync, clear text mein TCP 28769 aur 28260 ya encrypted TCP 28. HA2 session synchronisation carry karta hai, Ethernet, IP protocol 99 ya UDP 29281 se. Yeh bhi jodo ki HA1 ke backups hote hain, heartbeat backup management port use karta hai, aur achhe designs shared switches se bachte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA1 control, hello, heartbeat aur config sync hai; HA2 session sync hai.</li>
<li>Defaults: hello 8000 ms aur heartbeat 1000 ms.</li>
<li>HA1 kisi shared path se guzre to encrypt karo.</li>
<li>Split brain se bachne ke liye HA1 backup aur heartbeat backup lagao.</li>
<li>HA2 transport: Ethernet, IP (protocol 99) ya UDP (29281).</li>
</ul></div>
`}};export{e as default};