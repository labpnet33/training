var e={id:`ise-coa`,h:{en:`ISE integration, CWA redirect and Change of Authorization (concept only)`,hi:`ISE integration, CWA redirect aur Change of Authorization (concept only)`},body:{en:`
<p>Picture a large airport. The <b>check-in desk</b> (the controller) does not decide who may fly. It checks a passport against the <b>airline's central system</b> (the policy server), and that system answers: "yes, seat 12A, lounge access" or "no". Later, if the airline cancels a ticket, it can call the desk and say "remove this passenger now". Cisco ISE plays the airline's role for Wi-Fi. This chapter is <b>concept only</b>: the simulator has one RADIUS server (RAD1) that answers authentication and a VLAN, but it does not run ISE, redirects, posture or CoA. You still need the ideas, because they are the heart of the security blueprint.</p>

<h3>The roles in a RADIUS design</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>The client software that speaks 802.1X (phone, laptop).</dd>
<dt>Authenticator / NAS</dt><dd>The device that guards the network and relays requests: the wireless controller. It is the RADIUS <b>client</b>, identified to the server by its IP address (here the management address 10.10.99.10) and a shared secret.</dd>
<dt>Authentication server</dt><dd>The RADIUS server that decides. In an enterprise this is ISE (policy engine). In our lab it is RAD1 at 10.10.60.20.</dd>
<dt>Authorization result</dt><dd>What the server returns with an accept: VLAN, ACL name, downloadable ACL, security group tag, session timeout, URL redirect.</dd>
</dl>
<p>From wl-security you know authentication (who are you?). <b>Authorization</b> is the second half: what may you do now? ISE evaluates rules such as "user is in group Finance AND device is a corporate laptop AND connected by Wi-Fi" and returns an <b>authorization profile</b>.</p>

<h3>What the controller must have for ISE to work</h3>
<ul>
<li>A RADIUS <b>server</b> entry (address, ports 1812 and 1813, shared key) and a <b>server group</b>. Web UI: <b>Configuration &gt; Security &gt; AAA</b>, tabs Servers and Server Groups.</li>
<li>Method lists: <code>aaa authentication dot1x ...</code> for 802.1X, <code>aaa authorization network ...</code> for the result, and <code>aaa accounting identity ...</code> so the server tracks sessions. Tab AAA Method List.</li>
<li><b>AAA override</b> on the policy profile so the controller accepts the VLAN or ACL the server sends (chapter 4).</li>
<li><b>CoA enabled</b> so the server may change a session later: the controller must accept dynamic authorization requests from the server, normally configured as a dynamic-author client with the server address and key. Exact syntax varies by release, check your release guide.</li>
<li>Reachability: ISE must also have the controller listed as a <b>network device</b> with the same shared secret. A mismatch shows as a timeout or "invalid authenticator" in the logs (you met this in wl-security).</li>
</ul>

<h3>Central Web Authentication, step by step (concept only)</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="CWA flow with redirect and CoA">
<rect x="10" y="100" width="100" height="44" rx="8" fill="#bae6fd"/><text x="60" y="127" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="270" y="100" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<rect x="530" y="100" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="580" y="127" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="110" y1="122" x2="270" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="122" x2="530" y2="122" stroke="#64748b" stroke-width="2"/>
<text x="190" y="112" text-anchor="middle" class="svg-muted" font-size="11">1 open + MAC filter</text>
<text x="450" y="112" text-anchor="middle" class="svg-muted" font-size="11">2 MAB request</text>
<text x="450" y="146" text-anchor="middle" class="svg-muted" font-size="11">3 accept + redirect ACL + URL</text>
<text x="190" y="146" text-anchor="middle" class="svg-muted" font-size="11">4 browser redirected to ISE</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">5 user signs in on the ISE portal</text>
<text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">6 ISE sends CoA to WLC: reauthenticate</text>
<text x="320" y="234" text-anchor="middle" class="svg-accent" font-size="12">7 new accept: final VLAN / ACL / tag, client state RUN</text>
</svg><p class="cap">CWA uses MAB first, then redirect, then CoA. The controller never sees the user password.</p></div>
<ol>
<li>The WLAN is open with <b>MAC filtering</b> pointing at ISE. The client associates and the controller sends a MAB request (chapter 5).</li>
<li>ISE has no web login yet, so it returns <b>Access-Accept with a redirect</b>: the attributes <code>url-redirect</code> (the portal address) and <code>url-redirect-acl</code> (the name of an ACL on the controller).</li>
<li>The <b>redirect ACL</b> on the controller selects which traffic is hijacked: in this ACL a <b>permit</b> means "redirect this traffic", a <b>deny</b> means "let it pass untouched" (DNS, DHCP, the ISE address). It is not a firewall rule, a confusing point for beginners.</li>
<li>The controller web server must be on, because it intercepts the browser request and sends the redirect.</li>
<li>The user signs in on ISE's portal. ISE then sends a <b>Change of Authorization (CoA)</b> to the controller, which re-runs authorization and applies the final result.</li>
</ol>

<h3>Change of Authorization</h3>
<p><b>CoA</b> (RFC 5176) lets the server push a change to an existing session. Two common requests: <b>Disconnect-Request</b> (end the session) and <b>CoA-Request</b> (apply new attributes, for example re-authenticate, new ACL or new tag). The controller answers with ACK or NAK. CoA travels the other way from normal RADIUS: server to controller, on a UDP port the controller listens on (RFC 5176 names 3799; some platforms use 1700, check your release). If a firewall blocks it, login looks fine but the user is stuck on the portal forever.</p>

<h3>Downloadable ACL, posture and the limits</h3>
<p>A <b>dACL</b> is an ACL defined on ISE and downloaded by name when the user connects, so the policy is edited in one place. Support for dACLs on wireless depends on the release and switching mode, so check it. <b>Posture</b> asks an agent on the client about patches and antivirus before granting full access; non-compliant clients get a quarantine result. All of this is concept only here.</p>

<div class="eg"><p><b>Worked example.</b> A contractor with an unknown tablet connects to NK-BYOD. ISE returns: redirect to the registration portal, ACL <code>REDIRECT-ACL</code>. After registration CoA fires; ISE now returns VLAN 40 and tag "Contractor". Same SSID, two different results in one minute.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Redirect ACL written like a firewall ACL (denying what should be redirected). Controller web server off, so the browser never redirects. CoA port blocked. Shared secret differs on the controller and in ISE. AAA override off, so the returned VLAN is ignored.</p></div>

<div class="exam"><p><b>Exam traps.</b> In a CWA redirect ACL, permit = redirect, deny = bypass. CoA is initiated by the server. MAB is the first step of CWA, and the final access arrives after CoA, not at the first accept.</p></div>

<div class="scn"><h4>Stuck on the portal</h4><p>Users signed in on the ISE portal but stayed on the redirect page. ISE logs showed "CoA failed: no response". The controller accepted the portal login but a new firewall between ISE and the controller had dropped the CoA port. After opening the port, the CoA arrived and the clients moved to their final VLAN.</p><p><b>Lesson:</b> CWA has two directions. Test both: controller to server for RADIUS, server to controller for CoA.</p></div>

<div class="iv"><p class="q">"Explain central web authentication on a wireless controller."</p><p>Open WLAN with MAC filtering to ISE, ISE answers with a redirect URL and a redirect ACL, the controller web server intercepts the browser, the user logs in on the ISE portal, and ISE sends CoA so the controller applies the final authorization. Mention that the redirect ACL uses permit for traffic to redirect, and that CoA needs server-to-controller reachability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The controller is the RADIUS client (NAS); ISE or RAD1 decides and returns the authorization result.</li>
<li>CWA flow: MAB, accept with redirect, user login on the portal, CoA, final authorization.</li>
<li>Redirect ACL: permit means redirect, deny means bypass.</li>
<li>CoA is server-initiated: Disconnect-Request or CoA-Request; its port must be reachable.</li>
<li>All of this chapter is concept only in the simulator; RAD1 supplies only the VLAN (chapter 4).</li>
</ul></div>
`,hi:`
<p>Ek bade airport ki tasveer socho. <b>Check-in desk</b> (controller) tay nahi karta ki kaun udega. Woh passport ko <b>airline ke central system</b> (policy server) se check karta hai, aur system jawab deta hai: "haan, seat 12A, lounge access" ya "nahi". Baad mein agar airline ticket cancel kare, to woh desk ko call karke keh sakti hai "is passenger ko abhi hata do". Wi-Fi ke liye Cisco ISE airline ka role nibhata hai. Yeh chapter <b>concept only</b> hai: simulator mein ek RADIUS server (RAD1) hai jo authentication aur VLAN return karta hai, lekin ISE, redirects, posture ya CoA run nahi hote. Phir bhi aapko yeh ideas chahiye, kyunki yeh security blueprint ka dil hain.</p>

<h3>RADIUS design ke roles</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Client software jo 802.1X bolta hai (phone, laptop).</dd>
<dt>Authenticator / NAS</dt><dd>Device jo network ki raakhwali karta hai aur requests relay karta hai: wireless controller. Yeh RADIUS <b>client</b> hai, server ko apne IP address (yahan management address 10.10.99.10) aur shared secret se pehchaana jata hai.</dd>
<dt>Authentication server</dt><dd>RADIUS server jo decide karta hai. Enterprise mein yeh ISE (policy engine) hai. Hamari lab mein RAD1 hai, 10.10.60.20 par.</dd>
<dt>Authorization result</dt><dd>Accept ke saath server jo return karta hai: VLAN, ACL naam, downloadable ACL, security group tag, session timeout, URL redirect.</dd>
</dl>
<p>wl-security se aap authentication (aap kaun ho?) jaante ho. <b>Authorization</b> doosra half hai: ab aap kya kar sakte ho? ISE aise rules evaluate karta hai: "user Finance group mein hai AUR device corporate laptop hai AUR Wi-Fi se connected hai" aur ek <b>authorization profile</b> return karta hai.</p>

<h3>ISE ke kaam ke liye controller par kya chahiye</h3>
<ul>
<li>RADIUS <b>server</b> entry (address, ports 1812 aur 1813, shared key) aur ek <b>server group</b>. Web UI: <b>Configuration &gt; Security &gt; AAA</b>, tabs Servers aur Server Groups.</li>
<li>Method lists: 802.1X ke liye <code>aaa authentication dot1x ...</code>, result ke liye <code>aaa authorization network ...</code>, aur <code>aaa accounting identity ...</code> taaki server sessions track kare. Tab AAA Method List.</li>
<li>Policy profile par <b>AAA override</b> taaki controller server ka bheja VLAN ya ACL accept kare (chapter 4).</li>
<li><b>CoA enabled</b> taaki server baad mein session badal sake: controller ko server se dynamic authorization requests accept karni hoti hain, aam taur par dynamic-author client ke taur par server address aur key ke saath. Exact syntax release ke hisaab se badalta hai, apni release guide dekho.</li>
<li>Reachability: ISE mein bhi controller <b>network device</b> ke taur par same shared secret ke saath listed hona chahiye. Mismatch logs mein timeout ya "invalid authenticator" ke roop mein dikhta hai (wl-security mein dekha tha).</li>
</ul>

<h3>Central Web Authentication, step by step (concept only)</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="CWA flow redirect aur CoA ke saath">
<rect x="10" y="100" width="100" height="44" rx="8" fill="#bae6fd"/><text x="60" y="127" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="270" y="100" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<rect x="530" y="100" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="580" y="127" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="110" y1="122" x2="270" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="122" x2="530" y2="122" stroke="#64748b" stroke-width="2"/>
<text x="190" y="112" text-anchor="middle" class="svg-muted" font-size="11">1 open + MAC filter</text>
<text x="450" y="112" text-anchor="middle" class="svg-muted" font-size="11">2 MAB request</text>
<text x="450" y="146" text-anchor="middle" class="svg-muted" font-size="11">3 accept + redirect ACL + URL</text>
<text x="190" y="146" text-anchor="middle" class="svg-muted" font-size="11">4 browser ISE par redirect</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">5 user ISE portal par sign in karta hai</text>
<text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">6 ISE WLC ko CoA bhejta hai: reauthenticate</text>
<text x="320" y="234" text-anchor="middle" class="svg-accent" font-size="12">7 naya accept: final VLAN / ACL / tag, client state RUN</text>
</svg><p class="cap">CWA pehle MAB, phir redirect, phir CoA use karta hai. Controller user ka password kabhi nahi dekhta.</p></div>
<ol>
<li>WLAN open hai aur <b>MAC filtering</b> ISE ki taraf point karti hai. Client associate hota hai aur controller MAB request bhejta hai (chapter 5).</li>
<li>ISE ke paas abhi web login nahi hai, to woh <b>redirect ke saath Access-Accept</b> return karta hai: attributes <code>url-redirect</code> (portal ka address) aur <code>url-redirect-acl</code> (controller par ek ACL ka naam).</li>
<li>Controller par <b>redirect ACL</b> chunti hai ki kaunsa traffic hijack hoga: is ACL mein <b>permit</b> ka matlab "is traffic ko redirect karo", <b>deny</b> ka matlab "ise bina chhue jaane do" (DNS, DHCP, ISE ka address). Yeh firewall rule nahi hai, beginners ke liye confusing point.</li>
<li>Controller web server on hona chahiye, kyunki woh browser request intercept karke redirect bhejta hai.</li>
<li>User ISE ke portal par sign in karta hai. Phir ISE controller ko <b>Change of Authorization (CoA)</b> bhejta hai, jo authorization dobara chalata hai aur final result apply karta hai.</li>
</ol>

<h3>Change of Authorization</h3>
<p><b>CoA</b> (RFC 5176) server ko existing session par change push karne deta hai. Do common requests: <b>Disconnect-Request</b> (session khatam karo) aur <b>CoA-Request</b> (naye attributes lagao, jaise re-authenticate, naya ACL ya naya tag). Controller ACK ya NAK se jawab deta hai. CoA normal RADIUS se ulti direction mein chalta hai: server se controller ki taraf, us UDP port par jise controller sunta hai (RFC 5176 mein 3799 hai; kuch platforms 1700 use karte hain, apni release check karo). Agar firewall ise block kare, to login theek dikhta hai lekin user hamesha portal par atka rehta hai.</p>

<h3>Downloadable ACL, posture aur limits</h3>
<p><b>dACL</b> ek aisa ACL hai jo ISE par define hota hai aur user connect hone par naam se download hota hai, isliye policy ek hi jagah edit hoti hai. Wireless par dACL ka support release aur switching mode par depend karta hai, isliye check karo. <b>Posture</b> client ke agent se patches aur antivirus ke baare mein poochta hai, tab full access milta hai; non-compliant clients ko quarantine result milta hai. Yeh sab yahan concept only hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek contractor ka unknown tablet NK-BYOD se connect hota hai. ISE return karta hai: registration portal par redirect, ACL <code>REDIRECT-ACL</code>. Registration ke baad CoA chalta hai; ab ISE VLAN 40 aur tag "Contractor" return karta hai. Same SSID, ek minute mein do alag results.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Redirect ACL ko firewall ACL ki tarah likhna (jo redirect hona chahiye use deny karna). Controller web server off, isliye browser kabhi redirect nahi hota. CoA port blocked. Controller aur ISE mein shared secret alag. AAA override off, isliye bheja gaya VLAN ignore ho jata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> CWA redirect ACL mein permit = redirect, deny = bypass. CoA server initiate karta hai. MAB CWA ka pehla step hai, aur final access CoA ke baad aata hai, pehle accept par nahi.</p></div>

<div class="scn"><h4>Portal par atke</h4><p>Users ne ISE portal par sign in kiya lekin redirect page par hi rahe. ISE logs mein "CoA failed: no response" tha. Controller ne portal login accept kiya lekin ISE aur controller ke beech naye firewall ne CoA port drop kar diya tha. Port kholne ke baad CoA pahunchi aur clients final VLAN mein chale gaye.</p><p><b>Lesson:</b> CWA ki do directions hain. Dono test karo: RADIUS ke liye controller se server, CoA ke liye server se controller.</p></div>

<div class="iv"><p class="q">"Wireless controller par central web authentication samjhao."</p><p>Open WLAN, ISE ki taraf MAC filtering, ISE redirect URL aur redirect ACL ke saath jawab deta hai, controller web server browser ko intercept karta hai, user ISE portal par login karta hai, aur ISE CoA bhejta hai taaki controller final authorization apply kare. Bolo ki redirect ACL mein jo traffic redirect karna hai uske liye permit hota hai, aur CoA ko server-to-controller reachability chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller RADIUS client (NAS) hai; ISE ya RAD1 decide karta hai aur authorization result return karta hai.</li>
<li>CWA flow: MAB, redirect ke saath accept, portal par user login, CoA, final authorization.</li>
<li>Redirect ACL: permit matlab redirect, deny matlab bypass.</li>
<li>CoA server-initiated hai: Disconnect-Request ya CoA-Request; uska port reachable hona chahiye.</li>
<li>Is chapter ka sab kuch simulator mein concept only hai; RAD1 sirf VLAN deta hai (chapter 4).</li>
</ul></div>
`}};export{e as default};