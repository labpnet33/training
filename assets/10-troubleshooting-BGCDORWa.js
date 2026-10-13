var e=String.raw`<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder for eAPI">
<rect x="20" y="10" width="330" height="34" rx="6" fill="#ddd6fe"/><text x="30" y="32" class="svg-ink" font-size="13">1 Network: can packets reach the switch?</text><text x="360" y="32" class="svg-muted" font-size="12">timed out</text>
<rect x="20" y="52" width="330" height="34" rx="6" fill="#ddd6fe"/><text x="30" y="74" class="svg-ink" font-size="13">2 Port: does something listen on it?</text><text x="360" y="74" class="svg-muted" font-size="12">Errno 111 refused</text>
<rect x="20" y="94" width="330" height="34" rx="6" fill="#fde68a"/><text x="30" y="116" class="svg-ink" font-size="13">3 Protocol: TLS where TLS is expected?</text><text x="360" y="116" class="svg-muted" font-size="12">unable to connect to eAPI</text>
<rect x="20" y="136" width="330" height="34" rx="6" fill="#fde68a"/><text x="30" y="158" class="svg-ink" font-size="13">4 Login: user and password accepted?</text><text x="360" y="158" class="svg-muted" font-size="12">HttpError 401</text>
<rect x="20" y="178" width="330" height="34" rx="6" fill="#fecaca"/><text x="30" y="200" class="svg-ink" font-size="13">5 Privilege: may the user enable?</text><text x="360" y="200" class="svg-muted" font-size="12">CommandError 1002 on enable</text>
<rect x="20" y="220" width="330" height="34" rx="6" fill="#fecaca"/><text x="30" y="242" class="svg-ink" font-size="13">6 Command: is the command valid?</text><text x="360" y="242" class="svg-muted" font-size="12">CommandError 1002 / 1003</text>
</svg></div>
<p class="cap">Work from the top. The first rung that fails is the answer, whatever the lower rungs say.</p>`,t=String.raw`<pre class="code"><span class="c"># Lab 2: the first run</span>
AUTO01$ python3 fleetcheck.py
leaf1  DOWN  HttpError: Unauthorized. Check the user name and password (HT&#84;P 401)
leaf2  DOWN  ConnectionError: Socket error during eAPI connection: [Errno 111] Connection refused
leaf3  DOWN  ConnectionError: Socket error during eAPI connection: timed out
0 of 3 leaves answered

<span class="c"># leaf1: the profile has Nk@2026, the user's password is NK@2026</span>
AUTO01$ sed -i 's/Nk@2026/NK@2026/' .eapi.conf
AUTO01$ python3 fleetcheck.py
leaf1  CMD   CommandError code=1002: Error [1002]: CLI command 3 of 3 'show ip bgp sumary' failed: invalid command [Invalid input (at token 3: 'sumary')]
...
<span class="c"># the typo was hidden behind the login failure. Fix it:</span>
AUTO01$ sed -i 's/sumary/summary/' fleetcheck.py
AUTO01$ python3 fleetcheck.py
leaf1  OK    vEOS-lab 4.31.4M, 0 BGP peer(s)
leaf2  DOWN  ConnectionError: Socket error during eAPI connection: [Errno 111] Connection refused
leaf3  DOWN  ConnectionError: Socket error during eAPI connection: timed out
1 of 3 leaves answered</pre>`,n=String.raw`<pre class="code"><span class="c"># leaf2 refused: ask the switch, not the script</span>
LEAF2# show management api h&#116;tp-commands
Enabled:            <span class="hl">No</span>
HTTPS server:       shutdown, set to use port 443
HT&#84;P server:        shutdown, set to use port 80
...
Hits:               0
Last hit:           never

LEAF2# configure terminal
LEAF2(config)# management api h&#116;tp-commands
LEAF2(config-mgmt-api-h&#116;tp-cmds)# no shutdown

AUTO01$ python3 fleetcheck.py
leaf2  DOWN  ConnectionError: <span class="hl">unable to connect to eAPI</span></pre>`,r=String.raw`<pre class="code"><span class="c"># leaf2 again: the profile says transport h&#116;tp with port 443, but 443 is TLS-only</span>
AUTO01$ sed -i 's/^transport: h&#116;tp$/transport: h&#116;tps/; /^port: 443$/d' .eapi.conf
AUTO01$ python3 fleetcheck.py
leaf1  OK    vEOS-lab 4.31.4M, 0 BGP peer(s)
leaf2  OK    vEOS-lab 4.31.4M, 0 BGP peer(s)
leaf3  DOWN  ConnectionError: Socket error during eAPI connection: timed out

<span class="c"># leaf3 timed out: the port is open on the switch but an ACL drops our address</span>
LEAF3# show running-config section management api
management api h&#116;tp-commands
   protocol h&#116;tps
   ip access-group EAPI
   no shutdown
LEAF3# configure terminal
LEAF3(config)# management api h&#116;tp-commands
LEAF3(config-mgmt-api-h&#116;tp-cmds)# no ip access-group EAPI

AUTO01$ python3 fleetcheck.py
leaf3  CMD   CommandError code=1002: Error [1002]: CLI command 1 of 3 'enable' failed: invalid command [Invalid password]

AUTO01$ echo 'enablepwd: Ena@2026' >> .eapi.conf
AUTO01$ python3 fleetcheck.py
leaf1  OK    vEOS-lab 4.31.4M, 0 BGP peer(s)
leaf2  OK    vEOS-lab 4.31.4M, 0 BGP peer(s)
leaf3  OK    vEOS-lab 4.31.4M, 0 BGP peer(s)
3 of 3 leaves answered
AUTO01$ chmod 600 .eapi.conf</pre>`,i={id:`troubleshooting`,h:{en:`Troubleshooting eAPI from the script and from the switch`,hi:`Script aur switch dono se eAPI troubleshoot karna`},body:{en:`
<p>This is Lab 2. Three leaves, one script, and each leaf fails in a different way. The skill is not memorising seven fixes. It is a fixed order of questions, so the same method finds the next fault on a switch you have never seen.</p>

<h3>The ladder</h3>
`+e+`
<p>Each rung must hold before the next one can. A login failure only appears if the port answers, and a command error only appears if the login works. That is why fixing one fault reveals the next, and why the same script gives a different message after each fix.</p>

<h3>Use both ends</h3>
<ul>
<li><b>From the script</b>: the exception class and text name the rung (chapter 5).</li>
<li><b>From the switch</b>: <code>show management api h&#116;tp-commands</code> tells you if the service is enabled, which protocol and port it uses, and the <code>Hits</code> and <code>Requests</code> counters. If you run your script and <code>Hits</code> do not move, the request never arrived: look at the network. If they move, the switch is being reached: look at login and commands.</li>
<li><code>show running-config section management api</code> shows protocol, port and any <code>ip access-group</code> on the service.</li>
</ul>

<h3>Rungs 4 and 6: login, then the typo</h3>
<p>leaf1 first shows a 401. The profile has <code>Nk@2026</code>, the user's password is <code>NK@2026</code>: a case slip. Passwords are case sensitive, and a profile is just a text file, so compare it character by character. Fixing it uncovers rung 6, a typo (<code>sumary</code>) that was hiding behind the login failure.</p>
`+t+`
<h3>Rungs 2 and 3: refused, then the wrong protocol</h3>
<p>leaf2 says <b>refused</b>: the switch answered the TCP attempt with a reset, so something is there to say no. A look on the switch shows <code>Enabled: No</code>, the service was shut. After <code>no shutdown</code> the message changes, which means progress. Now the profile says <code>transport: h&#116;tp</code> with <code>port: 443</code>, plain text spoken to a TLS port. The switch does not understand it, and pyeapi reports <code>unable to connect to eAPI</code>.</p>
`+n+`
<div class="note"><p><b>In the lab vs on real gear.</b> The exact words for plain <code>h&#116;tp</code> sent to a TLS port are the lab's wording. A real switch may close the connection or answer differently. Treat "unable to connect" as the clue that you should check transport and port, and confirm with <code>show management api h&#116;tp-commands</code>.</p></div>

<h3>Rungs 1 and 5: timed out, then the enable password</h3>
<p>leaf3 says <b>timed out</b>, the slow one: nothing answered. Yet the switch has eAPI enabled. The switch-side config shows <code>ip access-group EAPI</code> on the service, an ACL that denies our server (10.99.0.60) and permits everything else. Packets from the script are dropped, so no reply and no reset. Remove the ACL (or, in real life, permit the automation host) and a new error appears: the login works, but <code>enable</code> fails. The <code>viewer</code> user has privilege 1 and the switch has an enable secret, so pyeapi's automatic <code>enable</code> needs the password in the profile as <code>enablepwd</code>.</p>
`+r+`
<p>The last line, <code>chmod 600 .eapi.conf</code>, closes the lab: the file holds three passwords in clear text and must not be readable by other users.</p>
<div class="warn"><p><b>Common mistake.</b> Removing a security ACL to "make it work" on a real switch. The lab does it to teach the symptom. In production, permit the automation host and keep the ACL.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Refused" and "timed out" both mean the script could not connect, but they point in opposite directions: refused is a reachable switch with nothing listening, timed out is a filter or a dead path. Do not look for a firewall when the answer is refused.</p></div>

<div class="scn"><h4>Everything is red after the upgrade</h4><p>After a software upgrade, every switch in one site turned <code>DOWN</code> in the nightly report with <code>unable to connect to eAPI</code>. The scripts and credentials had not changed. On one switch <code>show management api h&#116;tp-commands</code> showed HTTPS shut and HT&#84;P on port 80: the new image had restored a default. The fix was a config change for the site, not a code change.</p><p><b>Lesson:</b> when many switches fail the same way at the same time, suspect what they share (an upgrade, an ACL, AAA), not the script.</p></div>

<div class="iv"><p class="q">"Your pyeapi script times out on one switch but works on others. What do you check?"</p><p>Timed out means packets are being dropped, not refused. I check the path and filters: ping and the route from the automation host, then on the switch <code>show running-config section management api</code> for an <code>ip access-group</code> or a VRF restriction, and the <code>Hits</code> counter in <code>show management api</code> to confirm the request never arrives. If the counter moves, the problem is above the network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the ladder: network, port, protocol, login, privilege, command. The first failing rung is the fault.</li>
<li>Timed out is a filter or dead path; refused is a closed service; unable to connect is a protocol or port mismatch.</li>
<li>401 is credentials; <code>1002</code> on <code>enable</code> is privilege, fixed with <code>enablepwd</code>.</li>
<li><code>show management api h&#116;tp-commands</code> and its <code>Hits</code> counter show whether requests arrive.</li>
<li>Fixing one fault reveals the next; re-run after every fix.</li>
</ul></div>
`,hi:`
<p>Yeh Lab 2 hai. Teen leaves, ek script, aur har leaf alag tarah fail hota hai. Hunar saat fixes ratna nahi hai. Hunar sawaalon ka tay kram hai, taaki wahi tareeka us switch par agla fault dhoondh de jo aapne kabhi dekha nahi.</p>

<h3>Seedhi</h3>
`+e+`
<p>Har rung agle se pehle thehni chahiye. Login failure tabhi dikhta hai jab port jawab de, aur command error tabhi jab login chale. Isi liye ek fault theek karne se agla dikhta hai, aur wahi script har fix ke baad alag message deti hai.</p>

<h3>Dono sire use karo</h3>
<ul>
<li><b>Script se</b>: exception class aur text rung ka naam batate hain (chapter 5).</li>
<li><b>Switch se</b>: <code>show management api h&#116;tp-commands</code> batata hai service enabled hai ya nahi, kaunsa protocol aur port, aur <code>Hits</code> aur <code>Requests</code> counters. Script chalao aur <code>Hits</code> na hile to request pahunchi hi nahi: network dekho. Hile to switch tak pahunch rahe ho: login aur commands dekho.</li>
<li><code>show running-config section management api</code> protocol, port aur service par laga koi <code>ip access-group</code> dikhata hai.</li>
</ul>

<h3>Rung 4 aur 6: login, phir typo</h3>
<p>leaf1 pehle 401 dikhata hai. Profile mein <code>Nk@2026</code> hai, user ka password <code>NK@2026</code>: case ki chook. Passwords case sensitive hain, aur profile bas text file hai, isliye character-by-character compare karo. Theek karne se rung 6 khulti hai, typo (<code>sumary</code>) jo login failure ke peeche chhupa tha.</p>
`+t+`
<h3>Rung 2 aur 3: refused, phir galat protocol</h3>
<p>leaf2 kehta hai <b>refused</b>: switch ne TCP koshish ka reset se jawab diya, yaani wahan mana karne wala koi hai. Switch par dekha to <code>Enabled: No</code>, service shut thi. <code>no shutdown</code> ke baad message badalta hai, yaani progress. Ab profile mein <code>transport: h&#116;tp</code> aur <code>port: 443</code> hai, plain text TLS port se bola ja raha hai. Switch samajhta nahi, aur pyeapi <code>unable to connect to eAPI</code> report karta hai.</p>
`+n+`
<div class="note"><p><b>Lab vs real gear.</b> TLS port ko plain <code>h&#116;tp</code> bhejne par ke exact shabd lab ke hain. Asli switch connection band kar sakta hai ya alag jawab de sakta hai. "Unable to connect" ko clue maano ki transport aur port check karo, aur <code>show management api h&#116;tp-commands</code> se confirm karo.</p></div>

<h3>Rung 1 aur 5: timed out, phir enable password</h3>
<p>leaf3 kehta hai <b>timed out</b>, dheema wala: kisi ne jawab hi nahi diya. Phir bhi switch par eAPI enabled hai. Switch ki config service par <code>ip access-group EAPI</code> dikhati hai, ek ACL jo hamara server (10.99.0.60) deny karta hai aur baaki sab permit. Script ke packets drop hote hain, isliye na reply na reset. ACL hatao (ya asli zindagi mein automation host ko permit karo) aur naya error aata hai: login chalta hai, par <code>enable</code> fail. <code>viewer</code> user privilege 1 ka hai aur switch par enable secret hai, isliye pyeapi ke automatic <code>enable</code> ko profile mein password <code>enablepwd</code> ki tarah chahiye.</p>
`+r+`
<p>Aakhri line, <code>chmod 600 .eapi.conf</code>, lab ko band karti hai: file mein teen passwords clear text mein hain aur doosre users ko padhne nahi chahiye.</p>
<div class="warn"><p><b>Common mistake.</b> Asli switch par "chalane ke liye" security ACL hata dena. Lab lakshan sikhane ke liye aisa karta hai. Production mein automation host ko permit karo aur ACL rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Refused" aur "timed out" dono ka matlab script connect nahi kar saki, par woh ulte disha mein ishara karte hain: refused matlab switch pahunch mein hai par koi sun nahi raha, timed out matlab filter ya mara hua raasta. Refused ho to firewall mat dhoondo.</p></div>

<div class="scn"><h4>Upgrade ke baad sab laal</h4><p>Software upgrade ke baad ek site ke har switch ne nightly report mein <code>unable to connect to eAPI</code> ke saath <code>DOWN</code> dikhaya. Scripts aur credentials nahi badle the. Ek switch par <code>show management api h&#116;tp-commands</code> ne HTTPS shut aur HT&#84;P port 80 par dikhaya: naye image ne default bahal kar diya tha. Fix us site ke liye config change tha, code change nahi.</p><p><b>Lesson:</b> kai switches ek hi samay ek hi tarah fail hon to woh dekho jo unme saanjha hai (upgrade, ACL, AAA), script nahi.</p></div>

<div class="iv"><p class="q">"Aapki pyeapi script ek switch par time out hoti hai, baaki par chalti hai. Kya check karoge?"</p><p>Timed out matlab packets drop ho rahe hain, refuse nahi. Raasta aur filters dekhta hoon: automation host se ping aur route, phir switch par <code>show running-config section management api</code> mein <code>ip access-group</code> ya VRF restriction, aur <code>show management api</code> ka <code>Hits</code> counter ki request kabhi pahunchi hi nahi. Counter hile to problem network ke upar hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seedhi use karo: network, port, protocol, login, privilege, command. Pehli fail hone wali rung hi fault hai.</li>
<li>Timed out matlab filter ya mara raasta; refused matlab band service; unable to connect matlab protocol ya port mismatch.</li>
<li>401 credentials hai; <code>enable</code> par <code>1002</code> privilege hai, <code>enablepwd</code> se theek.</li>
<li><code>show management api h&#116;tp-commands</code> aur uska <code>Hits</code> counter batata hai requests pahunch rahi hain ya nahi.</li>
<li>Ek fault theek karne se agla dikhta hai; har fix ke baad dobara chalao.</li>
</ul></div>
`}};export{i as default};