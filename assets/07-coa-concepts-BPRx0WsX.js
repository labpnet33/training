var e={id:`coa-concepts`,h:{en:`CoA and Disconnect: RFC 5176 explained`,hi:`CoA aur Disconnect: RFC 5176 samjho`},body:{en:`
<h3>Start with the problem: enforcement runs only at login</h3>
<p>Think about a hotel key card. The card is checked when you tap it on the door. If the manager later decides you may no longer enter the gym, changing the list at the front desk does nothing to the card already in your hand. Someone has to call you back to the desk and issue a new card. RADIUS works the same way. ClearPass evaluates its policy when it receives an Access-Request. The result, a role and a VLAN, is applied once. If you change the policy afterwards, or if the device becomes risky, an existing session keeps its old role until something forces it to authenticate again.</p>
<p>That something is <b>Change of Authorization</b>. The standard is <b>RFC 5176</b>, Dynamic Authorization Extensions to RADIUS. It reverses the usual direction: now the <b>server</b> sends a request to the <b>NAD</b>.</p>

<h3>The messages</h3>
<table class="cmp"><tr><th>Message</th><th>Code</th><th>Purpose</th></tr>
<tr><td>Disconnect-Request</td><td>40</td><td>Terminate a session now.</td></tr>
<tr><td>Disconnect-ACK / NAK</td><td>41 / 42</td><td>NAD reply: done, or refused.</td></tr>
<tr><td>CoA-Request</td><td>43</td><td>Change attributes or reauthenticate a session without ending it.</td></tr>
<tr><td>CoA-ACK / NAK</td><td>44 / 45</td><td>NAD reply: applied, or refused.</td></tr></table>
<p>The packets travel over UDP. The NAD listens on port <b>3799</b> (the older, non-standard port 1700 appears on some systems). The packet carries attributes that identify the session, such as the client MAC address in Calling-Station-Id, the User-Name and the NAS address, so that the NAD can find the right session. It is protected by the same RADIUS shared secret, which is why a secret mismatch makes the NAD reject the request.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="CoA direction">
<rect x="20" y="30" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">ClearPass (CPPM)</text><text x="95" y="74" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10</text>
<rect x="470" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="545" y="56" text-anchor="middle" class="svg-ink" font-size="13">ACCESS switch</text><text x="545" y="74" text-anchor="middle" class="svg-muted" font-size="12">10.20.99.2</text>
<line x1="170" y1="50" x2="470" y2="50" stroke="#64748b"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">Disconnect-Request / CoA-Request, UDP 3799</text>
<line x1="470" y1="72" x2="170" y2="72" stroke="#64748b"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">ACK or NAK</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Normal RADIUS: switch asks, ClearPass answers (UDP 1812).</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">CoA: ClearPass asks, switch answers (UDP 3799).</text>
</svg><p class="cap">CoA reverses the direction. Firewalls and ACLs must allow the server-to-NAD path as well.</p></div>

<h3>Disconnect versus CoA reauthentication</h3>
<ul>
<li><b>Disconnect</b> ends the session. The client must authenticate again. For wired 802.1X the supplicant normally restarts on its own, the new request reaches ClearPass, the current policy is evaluated, and the client gets whatever role the policy now says.</li>
<li><b>CoA</b> changes the live session. It can ask the NAD to reauthenticate the client or to apply different attributes, and the session does not necessarily drop. The attributes the NAD supports depend on the vendor. Aruba CX supports reauthenticate-style CoA and disconnects.</li>
</ul>
<p>In the lab, the Access Tracker offers both actions, <code>monitoring access-tracker disconnect MAC</code> and <code>monitoring access-tracker reauthorize MAC</code>. In the real product you use the session actions in the Access Tracker detail (the "Change Status" action) or you let an enforcement profile of a CoA type send it automatically when something changes, for example after a posture result.</p>

<h3>Where CoA is used in real networks</h3>
<ul>
<li><b>Guest portal login:</b> move the session from the pre-login role to the guest role (chapter 2).</li>
<li><b>Posture:</b> an unhealthy endpoint is moved to quarantine, and a fixed one is moved back (chapter 9).</li>
<li><b>Administrator action:</b> an analyst disconnects a suspicious device from the Access Tracker.</li>
<li><b>Account expiry or revocation:</b> end running sessions when an account is disabled.</li>
<li><b>Profiling and attribute updates:</b> when a new fingerprint changes the device category.</li>
</ul>

<h3>What both sides must agree on</h3>
<p>Two sides must be ready, and a missing piece on either side produces a different failure:</p>
<table class="cmp"><tr><th>Side</th><th>What must be configured</th></tr>
<tr><td>ClearPass</td><td>Network device ACCESS with CoA enabled, port 3799, and the same shared secret.</td></tr>
<tr><td>Switch (AOS-CX)</td><td><code>radius dyn-authorization enable</code> and <code>radius dyn-authorization client 10.20.60.10 secret-key plaintext ArubaNK1</code>.</td></tr>
<tr><td>Network path</td><td>UDP 3799 from ClearPass to the switch must not be blocked by an ACL or firewall.</td></tr></table>
<p>On the real product the CoA settings sit in the network device definition under <b>Configuration &gt; Network &gt; Devices</b>. The lab shell mirrors it with <code>configuration network device ACCESS coa 3799</code>.</p>

<div class="eg"><p><b>Worked example.</b> At 10:05 alice's laptop is flagged risky. At 10:06 an analyst changes the policy so that ENGINEER maps to the quarantine profile. Nothing happens to LAPTOP1: its session was authorized at 09:00 and keeps role EMPLOYEE in VLAN 10. At 10:07 the analyst sends a Disconnect from the Access Tracker. The switch drops the session, LAPTOP1 authenticates again, the new policy runs and the switch applies role QUARANTINE in VLAN 50. Policy change plus CoA together make the change real.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the enforcement policy and expecting live sessions to move. The policy is read only when a request is processed. Without a CoA, a reauthentication timer or a port bounce, nothing changes until the user logs in again.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoA and Disconnect are sent by the server to the NAD, to UDP 3799. They are not sent from the switch to ClearPass, and they do not use port 1812. If an exam asks "which side needs the dynamic-authorization client entry", the answer is the NAD, where the policy server is listed as an allowed client.</p></div>

<div class="scn"><h4>The device that stayed on the network</h4><p>A security analyst blocked a compromised laptop in the policy, but the user kept working for six hours because the session was still alive. The next day the team enabled dynamic authorization on all access switches, enabled CoA on the network devices and made "block device" an action that also sends a Disconnect. The same block now took effect in seconds.</p><p><b>Lesson:</b> a policy is a future decision; CoA applies it to the present.</p></div>

<div class="iv"><p class="q">"What is CoA and why do you need it?"</p><p>Strong answer: it is the RFC 5176 mechanism for a RADIUS server to change or end a session that is already active, because policy is evaluated only at authentication time. Mention Disconnect-Request and CoA-Request, UDP 3799, that the NAD must enable dynamic authorization with the server as a client and the same secret, and give a use case such as quarantine after a posture failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy is evaluated at login only, so live sessions need CoA or a reauthentication to change.</li>
<li>RFC 5176 defines Disconnect and CoA; the server sends them to the NAD on UDP 3799.</li>
<li>The NAD must enable dyn-authorization and list ClearPass as a client with the same secret.</li>
<li>ClearPass must have CoA enabled on the network device, port 3799.</li>
<li>Use cases: guest login, posture quarantine, admin disconnect, revocation.</li>
</ul></div>
`,hi:`
<h3>Problem se shuru karo: enforcement sirf login par chalta hai</h3>
<p>Hotel key card ke baare mein socho. Card door par tap karne par check hota hai. Agar manager baad mein decide kare ki aap ab gym mein nahi ja sakte, to front desk ki list badalne se aapke haath ke card par koi asar nahi padta. Kisi ko aapko desk par bulana padega aur naya card dena padega. RADIUS bhi aise hi kaam karta hai. ClearPass apni policy Access-Request milne par evaluate karta hai. Result, yaani role aur VLAN, ek baar apply hota hai. Baad mein policy badlo, ya device risky ho jaye, to existing session purane role par rehta hai jab tak kuch use dobara authenticate hone par majboor na kare.</p>
<p>Woh "kuch" hai <b>Change of Authorization</b>. Standard hai <b>RFC 5176</b>, Dynamic Authorization Extensions to RADIUS. Yeh usual direction ulat deta hai: ab <b>server</b> <b>NAD</b> ko request bhejta hai.</p>

<h3>Messages</h3>
<table class="cmp"><tr><th>Message</th><th>Code</th><th>Purpose</th></tr>
<tr><td>Disconnect-Request</td><td>40</td><td>Session abhi terminate karo.</td></tr>
<tr><td>Disconnect-ACK / NAK</td><td>41 / 42</td><td>NAD ka reply: ho gaya, ya refuse.</td></tr>
<tr><td>CoA-Request</td><td>43</td><td>Session ko end kiye bina attributes badlo ya reauthenticate karo.</td></tr>
<tr><td>CoA-ACK / NAK</td><td>44 / 45</td><td>NAD ka reply: apply hua, ya refuse.</td></tr></table>
<p>Packets UDP par chalte hain. NAD port <b>3799</b> par sunta hai (kuch systems par purana, non-standard port 1700 bhi dikhta hai). Packet mein woh attributes hote hain jo session ko identify karte hain, jaise Calling-Station-Id mein client MAC address, User-Name aur NAS address, taaki NAD sahi session dhundh sake. Yeh wahi RADIUS shared secret se protected hota hai, isliye secret mismatch hone par NAD request reject kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="CoA direction">
<rect x="20" y="30" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">ClearPass (CPPM)</text><text x="95" y="74" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10</text>
<rect x="470" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="545" y="56" text-anchor="middle" class="svg-ink" font-size="13">ACCESS switch</text><text x="545" y="74" text-anchor="middle" class="svg-muted" font-size="12">10.20.99.2</text>
<line x1="170" y1="50" x2="470" y2="50" stroke="#64748b"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">Disconnect-Request / CoA-Request, UDP 3799</text>
<line x1="470" y1="72" x2="170" y2="72" stroke="#64748b"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">ACK ya NAK</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Normal RADIUS: switch poochta hai, ClearPass jawab deta hai (UDP 1812).</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">CoA: ClearPass poochta hai, switch jawab deta hai (UDP 3799).</text>
</svg><p class="cap">CoA direction ulat deta hai. Firewalls aur ACLs ko server-se-NAD path bhi allow karna padta hai.</p></div>

<h3>Disconnect versus CoA reauthentication</h3>
<ul>
<li><b>Disconnect</b> session ko end karta hai. Client ko dobara authenticate karna padta hai. Wired 802.1X mein supplicant aam taur par apne aap restart hota hai, naya request ClearPass tak pahunchta hai, current policy evaluate hoti hai, aur client ko wahi role milta hai jo policy ab kehti hai.</li>
<li><b>CoA</b> live session ko badalta hai. Woh NAD se client ko reauthenticate karne ya alag attributes apply karne ko keh sakta hai, aur session zaroori nahi ki drop ho. Kaun se attributes supported hain yeh vendor par depend karta hai. Aruba CX reauthenticate-style CoA aur disconnects support karta hai.</li>
</ul>
<p>Lab mein Access Tracker dono actions deta hai, <code>monitoring access-tracker disconnect MAC</code> aur <code>monitoring access-tracker reauthorize MAC</code>. Real product mein aap Access Tracker detail ke session actions ("Change Status" action) use karte ho, ya CoA type ka enforcement profile kuch badalne par automatically bhejta hai, jaise posture result ke baad.</p>

<h3>Real networks mein CoA kahan use hota hai</h3>
<ul>
<li><b>Guest portal login:</b> session ko pre-login role se guest role mein le jaana (chapter 2).</li>
<li><b>Posture:</b> unhealthy endpoint ko quarantine mein, aur theek hone par wapas (chapter 9).</li>
<li><b>Administrator action:</b> analyst Access Tracker se suspicious device ko disconnect karta hai.</li>
<li><b>Account expiry ya revocation:</b> account disable hone par running sessions end karna.</li>
<li><b>Profiling aur attribute updates:</b> jab naya fingerprint device category badal de.</li>
</ul>

<h3>Dono sides ko kis par agree hona hai</h3>
<p>Do sides ready honi chahiye, aur kisi bhi side ka missing piece alag failure deta hai:</p>
<table class="cmp"><tr><th>Side</th><th>Kya configure hona chahiye</th></tr>
<tr><td>ClearPass</td><td>Network device ACCESS par CoA enabled, port 3799, aur wahi shared secret.</td></tr>
<tr><td>Switch (AOS-CX)</td><td><code>radius dyn-authorization enable</code> aur <code>radius dyn-authorization client 10.20.60.10 secret-key plaintext ArubaNK1</code>.</td></tr>
<tr><td>Network path</td><td>ClearPass se switch tak UDP 3799 ACL ya firewall se block nahi hona chahiye.</td></tr></table>
<p>Real product mein CoA settings network device definition mein hoti hain: <b>Configuration &gt; Network &gt; Devices</b>. Lab shell ise <code>configuration network device ACCESS coa 3799</code> se mirror karta hai.</p>

<div class="eg"><p><b>Worked example.</b> 10:05 par alice ka laptop risky flag hota hai. 10:06 par analyst policy badalta hai ki ENGINEER quarantine profile par map ho. LAPTOP1 par kuch nahi hota: uska session 09:00 par authorize hua tha aur role EMPLOYEE VLAN 10 mein rehta hai. 10:07 par analyst Access Tracker se Disconnect bhejta hai. Switch session drop karta hai, LAPTOP1 dobara authenticate karta hai, nayi policy chalti hai aur switch role QUARANTINE VLAN 50 mein apply karta hai. Policy change aur CoA milkar change ko real banate hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enforcement policy badalke yeh umeed karna ki live sessions move ho jayenge. Policy sirf tab padhi jaati hai jab request process hoti hai. CoA, reauthentication timer ya port bounce ke bina user ke dobara login karne tak kuch nahi badalta.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoA aur Disconnect server NAD ko UDP 3799 par bhejta hai. Yeh switch se ClearPass ko nahi jaate, aur port 1812 use nahi karte. Agar exam poochhe "dynamic-authorization client entry kis side ko chahiye", jawab hai NAD, jahan policy server allowed client ki tarah listed hota hai.</p></div>

<div class="scn"><h4>Jo device network par bana raha</h4><p>Security analyst ne compromised laptop ko policy mein block kiya, lekin user chhe ghante kaam karta raha kyunki session abhi zinda tha. Agle din team ne sab access switches par dynamic authorization enable kiya, network devices par CoA enable kiya aur "block device" ko aisi action banaya jo Disconnect bhi bhejti hai. Wahi block ab seconds mein effect karne laga.</p><p><b>Seekh:</b> policy future ka decision hai; CoA use present par apply karta hai.</p></div>

<div class="iv"><p class="q">"CoA kya hai aur ise kyun chahiye?"</p><p>Strong answer: yeh RFC 5176 mechanism hai jisse RADIUS server already active session ko badal ya end kar sakta hai, kyunki policy sirf authentication time par evaluate hoti hai. Disconnect-Request aur CoA-Request, UDP 3799 batao, ki NAD ko dynamic authorization enable karni hoti hai server ko client ke roop mein aur same secret ke saath, aur use case do jaise posture failure ke baad quarantine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy sirf login par evaluate hoti hai, isliye live sessions ko badalne ke liye CoA ya reauthentication chahiye.</li>
<li>RFC 5176 Disconnect aur CoA define karta hai; server unhe NAD ko UDP 3799 par bhejta hai.</li>
<li>NAD ko dyn-authorization enable karni hai aur ClearPass ko same secret ke saath client list karna hai.</li>
<li>ClearPass ko network device par CoA enable chahiye, port 3799.</li>
<li>Use cases: guest login, posture quarantine, admin disconnect, revocation.</li>
</ul></div>
`}};export{e as default};