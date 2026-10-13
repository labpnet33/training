var e={id:`eap-radius`,h:{en:`EAP and RADIUS: what travels on the wire`,hi:`EAP aur RADIUS: wire par kya jaata hai`},body:{en:`
<p>To troubleshoot 802.1X you must know which conversation happens where. There are two: <b>EAP over LAN (EAPOL)</b> between host and switch, and <b>RADIUS</b> between switch and server. The EAP message is the same; the switch only changes the envelope.</p>

<h3>EAP: the extensible part</h3>
<p>EAP (Extensible Authentication Protocol) is a framework. The real login method is the <b>EAP method</b> chosen by the supplicant and server:</p>
<table class="cmp"><tr><th>EAP method</th><th>Credentials</th><th>Notes</th></tr>
<tr><td>EAP-MD5</td><td>user name and password (challenge-response)</td><td>simple; no server authentication; used in the simulator labs</td></tr>
<tr><td>PEAP (MSCHAPv2)</td><td>user name and password inside a TLS tunnel</td><td>common with directory servers</td></tr>
<tr><td>EAP-TTLS</td><td>password inside a TLS tunnel</td><td>flexible inner methods</td></tr>
<tr><td>EAP-TLS</td><td>client and server certificates</td><td>strongest; needs a certificate for every device</td></tr></table>
<p>The switch does not care which method is used. It relays whatever EAP carries. This is why one EX configuration works with all of them. What does matter: the supplicant and the server must support a common method, otherwise the server answers with a reject.</p>

<h3>The exchange step by step</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="802.1X message flow">
<text x="70" y="20" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="570" y="20" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text>
<line x1="70" y1="28" x2="70" y2="285" stroke="#64748b" stroke-width="2"/><line x1="320" y1="28" x2="320" y2="285" stroke="#64748b" stroke-width="2"/><line x1="570" y1="28" x2="570" y2="285" stroke="#64748b" stroke-width="2"/>
<line x1="70" y1="50" x2="320" y2="50" stroke="#2563eb" stroke-width="2"/><text x="195" y="44" text-anchor="middle" class="svg-muted" font-size="11">EAPOL-Start</text>
<line x1="320" y1="80" x2="70" y2="80" stroke="#2563eb" stroke-width="2"/><text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="11">EAP-Request/Identity</text>
<line x1="70" y1="110" x2="320" y2="110" stroke="#2563eb" stroke-width="2"/><text x="195" y="104" text-anchor="middle" class="svg-muted" font-size="11">EAP-Response/Identity</text>
<line x1="320" y1="130" x2="570" y2="130" stroke="#16a34a" stroke-width="2"/><text x="445" y="124" text-anchor="middle" class="svg-muted" font-size="11">Access-Request (EAP)</text>
<line x1="570" y1="160" x2="320" y2="160" stroke="#16a34a" stroke-width="2"/><text x="445" y="154" text-anchor="middle" class="svg-muted" font-size="11">Access-Challenge</text>
<line x1="320" y1="180" x2="70" y2="180" stroke="#2563eb" stroke-width="2"/><text x="195" y="174" text-anchor="middle" class="svg-muted" font-size="11">EAP-Request (challenge)</text>
<line x1="70" y1="210" x2="320" y2="210" stroke="#2563eb" stroke-width="2"/><text x="195" y="204" text-anchor="middle" class="svg-muted" font-size="11">EAP-Response</text>
<line x1="320" y1="225" x2="570" y2="225" stroke="#16a34a" stroke-width="2"/><text x="445" y="219" text-anchor="middle" class="svg-muted" font-size="11">Access-Request</text>
<line x1="570" y1="250" x2="320" y2="250" stroke="#16a34a" stroke-width="2"/><text x="445" y="244" text-anchor="middle" class="svg-accent" font-size="11">Access-Accept (+VLAN)</text>
<line x1="320" y1="272" x2="70" y2="272" stroke="#2563eb" stroke-width="2"/><text x="195" y="266" text-anchor="middle" class="svg-accent" font-size="11">EAP-Success: port authorised</text>
</svg><p class="cap">Blue: EAPOL on the wire. Green: RADIUS in UDP.</p></div>

<h3>RADIUS in five facts</h3>
<ul>
<li>Transport is <b>UDP</b>; authentication on port 1812, accounting on 1813.</li>
<li>Messages: Access-Request, Access-Challenge, Access-Accept, Access-Reject.</li>
<li>The switch is a <b>NAS</b> (network access server); the server must know its address as a <b>client</b>.</li>
<li>Both sides hold a <b>shared secret</b>. It authenticates the switch and hides the password attribute. A wrong secret makes the server <b>ignore</b> the request, so the switch sees a timeout, not a reject.</li>
<li>The server may return attributes with the Access-Accept, the most important being the VLAN.</li>
</ul>

<h3>Dynamic VLAN assignment</h3>
<p>To place a user in a VLAN, the server returns three attributes: <code>Tunnel-Type = VLAN (13)</code>, <code>Tunnel-Medium-Type = 802 (6)</code> and <code>Tunnel-Private-Group-ID = VLAN name or ID</code>. The VLAN must already exist on the switch; if the name is unknown the authentication does not give access to that VLAN. In the lab, user riya is returned VLAN STAFF and her port, which was in LOBBY, moves.</p>

<h3>What the server logs: real output</h3>
<p>The lab RADIUS server NKRAD keeps a short log. Times are omitted here.</p>
<pre class="out">NKRAD&gt; aaa-server show log
Recent events:
  802.1X (EAP-MD5) PASS for riya (NAS 172.20.50.1, ge-0/0/1)
  802.1X (EAP-MD5) FAIL for kabir (NAS 172.20.50.1, ge-0/0/2): <span class="hl">wrong password</span>
  802.1X (EAP-MD5) FAIL for kabir (NAS 172.20.50.1, ge-0/0/2): wrong password</pre>
<p>The log names the NAS address (the switch, 172.20.50.1) and the port, so you can match a user to a physical jack. Compare this with the <b>shared key mismatch</b> message you will meet in chapter 8: there the server never reaches the user check.</p>

<div class="warn"><p><b>Common mistakes.</b> Using the RADIUS server's address as NAS address in its client list (the server must list the <i>switch</i>). Source address mismatch: the switch sends from the interface nearest the server unless <code>source-address</code> is set, and the server only trusts the address it knows. Returning a VLAN name that does not exist on this switch.</p></div>
<div class="exam"><p><b>Exam trap.</b> A wrong shared secret does <b>not</b> produce an Access-Reject; it produces silence and so a timeout. A wrong password produces a reject.</p></div>

<div class="scn"><h4>Secret with a trailing space</h4><p>After a RADIUS migration every authentication timed out, although ping to the server worked. The new server had the secret typed with a trailing space. The server log showed "shared key mismatch" for every request from the switch. Fixing the secret restored service immediately.</p><p><b>Lesson:</b> timeouts with a reachable server usually mean address or secret, not user credentials.</p></div>

<div class="iv"><p class="q">"What is the difference between EAPOL and RADIUS in an 802.1X exchange?"</p><p>EAPOL carries EAP between the supplicant and the switch at Layer 2, directly on the port. The switch repackages the EAP message inside RADIUS (UDP 1812) to the server. The switch is a relay and does not read the credentials. The server returns Accept or Reject, with optional attributes such as the VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAPOL host to switch; RADIUS switch to server in UDP 1812.</li>
<li>EAP method (MD5, PEAP, TTLS, TLS) is negotiated end to end; the switch is transparent.</li>
<li>The shared secret must match; a mismatch is silently dropped, so you see timeouts.</li>
<li>VLAN assignment uses Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-ID.</li>
<li>The server must know the switch address as a client.</li>
</ul></div>
`,hi:`
<p>802.1X troubleshoot karne ke liye pata hona chahiye ki kaunsi baat-cheet kahan hoti hai. Do hain: host aur switch ke beech <b>EAP over LAN (EAPOL)</b>, aur switch aur server ke beech <b>RADIUS</b>. EAP message wahi rehta hai; switch sirf lifafa badalta hai.</p>

<h3>EAP: extensible hissa</h3>
<p>EAP (Extensible Authentication Protocol) ek framework hai. Asli login method woh <b>EAP method</b> hai jo supplicant aur server chunte hain:</p>
<table class="cmp"><tr><th>EAP method</th><th>Credentials</th><th>Notes</th></tr>
<tr><td>EAP-MD5</td><td>user name aur password (challenge-response)</td><td>simple; server authentication nahi; simulator labs mein use hota hai</td></tr>
<tr><td>PEAP (MSCHAPv2)</td><td>TLS tunnel ke andar user name aur password</td><td>directory servers ke saath common</td></tr>
<tr><td>EAP-TTLS</td><td>TLS tunnel ke andar password</td><td>flexible inner methods</td></tr>
<tr><td>EAP-TLS</td><td>client aur server certificates</td><td>sabse strong; har device ko certificate chahiye</td></tr></table>
<p>Switch ko parwah nahi ki kaunsa method use hua. EAP jo le jaata hai woh relay kar deta hai. Isliye ek hi EX configuration sab ke saath chalti hai. Zaroori yeh hai: supplicant aur server ke paas common method ho, warna server reject bhejta hai.</p>

<h3>Exchange step by step</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="802.1X message flow">
<text x="70" y="20" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="570" y="20" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text>
<line x1="70" y1="28" x2="70" y2="285" stroke="#64748b" stroke-width="2"/><line x1="320" y1="28" x2="320" y2="285" stroke="#64748b" stroke-width="2"/><line x1="570" y1="28" x2="570" y2="285" stroke="#64748b" stroke-width="2"/>
<line x1="70" y1="50" x2="320" y2="50" stroke="#2563eb" stroke-width="2"/><text x="195" y="44" text-anchor="middle" class="svg-muted" font-size="11">EAPOL-Start</text>
<line x1="320" y1="80" x2="70" y2="80" stroke="#2563eb" stroke-width="2"/><text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="11">EAP-Request/Identity</text>
<line x1="70" y1="110" x2="320" y2="110" stroke="#2563eb" stroke-width="2"/><text x="195" y="104" text-anchor="middle" class="svg-muted" font-size="11">EAP-Response/Identity</text>
<line x1="320" y1="130" x2="570" y2="130" stroke="#16a34a" stroke-width="2"/><text x="445" y="124" text-anchor="middle" class="svg-muted" font-size="11">Access-Request (EAP)</text>
<line x1="570" y1="160" x2="320" y2="160" stroke="#16a34a" stroke-width="2"/><text x="445" y="154" text-anchor="middle" class="svg-muted" font-size="11">Access-Challenge</text>
<line x1="320" y1="180" x2="70" y2="180" stroke="#2563eb" stroke-width="2"/><text x="195" y="174" text-anchor="middle" class="svg-muted" font-size="11">EAP-Request (challenge)</text>
<line x1="70" y1="210" x2="320" y2="210" stroke="#2563eb" stroke-width="2"/><text x="195" y="204" text-anchor="middle" class="svg-muted" font-size="11">EAP-Response</text>
<line x1="320" y1="225" x2="570" y2="225" stroke="#16a34a" stroke-width="2"/><text x="445" y="219" text-anchor="middle" class="svg-muted" font-size="11">Access-Request</text>
<line x1="570" y1="250" x2="320" y2="250" stroke="#16a34a" stroke-width="2"/><text x="445" y="244" text-anchor="middle" class="svg-accent" font-size="11">Access-Accept (+VLAN)</text>
<line x1="320" y1="272" x2="70" y2="272" stroke="#2563eb" stroke-width="2"/><text x="195" y="266" text-anchor="middle" class="svg-accent" font-size="11">EAP-Success: port authorised</text>
</svg><p class="cap">Neela: wire par EAPOL. Hara: UDP mein RADIUS.</p></div>

<h3>RADIUS paanch facts mein</h3>
<ul>
<li>Transport <b>UDP</b> hai; authentication port 1812, accounting 1813.</li>
<li>Messages: Access-Request, Access-Challenge, Access-Accept, Access-Reject.</li>
<li>Switch ek <b>NAS</b> (network access server) hai; server ko uska address <b>client</b> ke roop mein pata hona chahiye.</li>
<li>Dono taraf <b>shared secret</b> hota hai. Yeh switch ko authenticate karta hai aur password attribute chhupata hai. Galat secret par server request <b>ignore</b> karta hai, isliye switch ko timeout dikhta hai, reject nahi.</li>
<li>Server Access-Accept ke saath attributes return kar sakta hai, sabse zaroori VLAN.</li>
</ul>

<h3>Dynamic VLAN assignment</h3>
<p>User ko VLAN mein daalne ke liye server teen attributes return karta hai: <code>Tunnel-Type = VLAN (13)</code>, <code>Tunnel-Medium-Type = 802 (6)</code> aur <code>Tunnel-Private-Group-ID = VLAN name ya ID</code>. VLAN switch par pehle se hona chahiye; naam anjaan ho to us VLAN ka access nahi milta. Lab mein user riya ko VLAN STAFF return hota hai aur uska port, jo LOBBY mein tha, move ho jaata hai.</p>

<h3>Server kya log karta hai: asli output</h3>
<p>Lab RADIUS server NKRAD chhota log rakhta hai. Yahan time hata diye gaye hain.</p>
<pre class="out">NKRAD&gt; aaa-server show log
Recent events:
  802.1X (EAP-MD5) PASS for riya (NAS 172.20.50.1, ge-0/0/1)
  802.1X (EAP-MD5) FAIL for kabir (NAS 172.20.50.1, ge-0/0/2): <span class="hl">wrong password</span>
  802.1X (EAP-MD5) FAIL for kabir (NAS 172.20.50.1, ge-0/0/2): wrong password</pre>
<p>Log NAS address (switch, 172.20.50.1) aur port batata hai, isliye user ko physical jack se match kar sakte ho. Chapter 8 mein jo <b>shared key mismatch</b> message milega usse compare karo: wahan server user check tak pahunchta hi nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> RADIUS server ke client list mein server ka apna address NAS ki jagah daalna (server ko <i>switch</i> list karna hai). Source address mismatch: <code>source-address</code> set na ho to switch server ke sabse paas wale interface se bhejta hai, aur server sirf wahi address maanta hai jo use pata hai. Aisa VLAN name return karna jo is switch par exist nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Galat shared secret Access-Reject <b>nahi</b> deta; chuppi deta hai, isliye timeout. Galat password reject deta hai.</p></div>

<div class="scn"><h4>Secret ke aakhir mein space</h4><p>RADIUS migration ke baad har authentication timeout hui, jabki server ko ping chal raha tha. Naye server par secret ke aakhir mein extra space type ho gaya tha. Server log mein switch se aayi har request par "shared key mismatch" tha. Secret theek karte hi service turant wapas aa gayi.</p><p><b>Lesson:</b> reachable server ke saath timeouts ka matlab aam taur par address ya secret hai, user credentials nahi.</p></div>

<div class="iv"><p class="q">"802.1X exchange mein EAPOL aur RADIUS mein kya difference hai?"</p><p>EAPOL supplicant aur switch ke beech Layer 2 par, seedha port par EAP le jaata hai. Switch EAP message ko RADIUS (UDP 1812) ke andar repackage karke server ko bhejta hai. Switch relay hai aur credentials nahi padhta. Server Accept ya Reject return karta hai, VLAN jaise optional attributes ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAPOL host se switch; RADIUS switch se server UDP 1812 mein.</li>
<li>EAP method (MD5, PEAP, TTLS, TLS) end to end negotiate hota hai; switch transparent hai.</li>
<li>Shared secret match hona chahiye; mismatch chupchaap drop hota hai, isliye timeouts dikhte hain.</li>
<li>VLAN assignment Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-ID se.</li>
<li>Server ko switch ka address client ke roop mein pata hona chahiye.</li>
</ul></div>
`}};export{e as default};