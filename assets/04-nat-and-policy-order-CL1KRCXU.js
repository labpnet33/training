var e={id:`nat-and-policy-order`,h:{en:`NAT and policy order`,hi:`NAT aur policy order`},body:{en:`
<p>Most NAT trouble is not a wrong address; it is a wrong assumption about <b>when</b> things happen. This chapter gives you one clear timeline for a new connection, and then shows how to use it to find faults quickly.</p>

<h3>Analogy: airport check-in, security and boarding</h3>
<p>You show your ticket (original details) at security. Only after you are cleared does the airline change your paper ticket into a boarding pass (translation), and only then are you directed to the right gate (routing). If you show the wrong paper at security, you never reach the boarding pass step.</p>

<h3>The timeline of a connection</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Order of processing">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. Access rules</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">original addresses</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. NAT rules</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">only after allow</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Routing</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="12">translated address</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">4. Out of interface</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">packet sent</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Access first, NAT second, routing third. Remember: Access rules never see the translated address.</p></div>

<ol>
<li><b>Access rules</b> are evaluated top down on the original source and destination. Template rules come first. No match means implicit discard. A discard here ends the story: NAT is not consulted.</li>
<li><b>NAT</b> is applied to connections that were allowed. The first matching NAT rule decides the translation.</li>
<li><b>Routing</b> then uses the translated destination (and the engine's routing table) to choose the interface.</li>
</ol>

<table class="cmp"><tr><th>Case</th><th>Access rule must match</th><th>Route is chosen for</th></tr>
<tr><td>Staff to Internet, dynamic NAT</td><td>src net-staff, dst any</td><td>the Internet destination, via eth1</td></tr>
<tr><td>Internet to published WEB1</td><td>dst = published (public) address</td><td>172.16.20.20, via eth3 DMZ</td></tr>
</table>

<h3>Translated addresses must be routable</h3>
<p>NAT gives a packet a new address, but something still has to deliver it. If you translate to an address, the engine routing table and the next router must know how to reach it, and on the way back the return packets must come to the engine. Typical failures: the translated destination 172.16.20.20 is not on any engine network and no route exists; or the translated source is an address the ISP does not route to you, so replies never come back. Open the engine Routing view in the Engines page and check that the translated address is covered.</p>

<div class="eg"><p><b>Worked example.</b> A DMZ publication does not work. Walk the timeline. Step 1: does an Access rule allow the published address with HTTP? Check Logs: the connection is discarded by the last rule, so no. Fix the Access destination. Retest: now it is allowed but times out. Step 2: is there a destination NAT rule that matches the public address and HTTP? Yes. Step 3: does the engine route 172.16.20.20? It is on eth3, yes. Last check: did we Install policy? The Install policy bar shows pending changes, so no. Install; the page loads. Four questions, in order, found two faults.</p></div>

<h3>Diagnose with the Logs page</h3>
<pre class="out">Time      Rule   Action     Src            Dst            Svc
10:02:11  7      Discard    198.51.100.77  203.0.113.10   HTTP
10:05:40  4      Allow      198.51.100.77  203.0.113.10   HTTP
<span class="hl">Rule 4 matched on the PUBLIC destination, so the Access rule is correct</span></pre>
<p>This sample output is illustrative. Read the rule number first: if it is the implicit discard or a broad lower rule, your Access rule did not match the original addresses. If the rule is right but the page still fails, move to NAT and routing.</p>

<h3>Order inside the NAT list</h3>
<p>Remember chapter 1: specific above general, no-NAT exceptions on top. Check shadowing: a broad rule such as source any, destination any, dynamic NAT placed first catches everything, and later rules never match. The editor warns about rules that can never be matched; warnings do not block Install, so read them.</p>

<div class="warn"><p><b>Common mistake.</b> Debugging NAT before checking Access. If Logs show a Discard, NAT is not the cause. Another one: assuming a reply needs its own Access rule. Replies of an allowed, tracked connection are handled by the connection, not by a rule.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions about "which address does the Access rule see". The answer is the original address, before any translation. For release-specific behaviour, check the documentation for your NGFW version.</p></div>

<div class="scn"><h4>The route nobody added</h4><p>An engineer translated a guest subnet to a separate public address block, but the ISP only routed the WAN address to Pune. Guests browsed, packets left, but no reply returned. A capture on the ISP side showed the replies being sent to an address that belonged to nobody. They switched the NAT rule to interface-ip, installed, and traffic returned.</p><p><b>Lesson:</b> a translated source address is only useful if the Internet can route replies to it.</p></div>

<div class="iv"><p class="q">"Does the firewall check the access policy before or after NAT?"</p><p>Strong answer: the Access rules are checked first, on the original addresses. NAT is applied afterwards, only to allowed connections, and before routing. So a published server needs an Access rule for its public address. Give the troubleshooting order: Access, NAT, routing, install.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Access rules, then NAT, then routing.</li>
<li>Access rules always see the original, pre-NAT addresses.</li>
<li>A discard in the Access rules stops the connection before NAT.</li>
<li>Translated addresses must be routable, both ways.</li>
<li>Use Logs rule numbers to decide whether the fault is Access, NAT or routing.</li>
</ul></div>
`,hi:`
<p>Zyadatar NAT problems galat address ki wajah se nahi hoti; woh galat assumption ki wajah se hoti hain ki cheezein <b>kab</b> hoti hain. Yeh chapter naye connection ki ek saaf timeline deta hai, aur dikhata hai ki isse faults jaldi kaise dhundhe jaate hain.</p>

<h3>Analogy: airport check-in, security aur boarding</h3>
<p>Aap security par apna ticket (original details) dikhate ho. Clear hone ke baad hi airline aapke paper ticket ko boarding pass (translation) mein badalti hai, aur uske baad hi aapko sahi gate (routing) ki taraf bheja jaata hai. Agar security par galat paper dikhaya to aap boarding pass step tak pahunchte hi nahi.</p>

<h3>Connection ki timeline</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Processing ka order">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. Access rules</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">original addresses</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. NAT rules</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">allow ke baad hi</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Routing</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="12">translated address</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">4. Interface se bahar</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">packet bheja gaya</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle Access, phir NAT, phir routing. Yaad rakho: Access rules translated address kabhi nahi dekhte.</p></div>

<ol>
<li><b>Access rules</b> original source aur destination par upar se neeche evaluate hote hain. Template rules pehle aate hain. Match na ho to implicit discard. Yahan discard hua to kahani khatam: NAT se poocha hi nahi jaata.</li>
<li><b>NAT</b> un connections par lagta hai jo allow hue. Pehla matching NAT rule translation decide karta hai.</li>
<li><b>Routing</b> phir translated destination (aur engine ki routing table) se interface chunti hai.</li>
</ol>

<table class="cmp"><tr><th>Case</th><th>Access rule ko match karna hai</th><th>Route kiske liye chuna jaata hai</th></tr>
<tr><td>Staff se Internet, dynamic NAT</td><td>src net-staff, dst any</td><td>Internet destination, eth1 se</td></tr>
<tr><td>Internet se published WEB1</td><td>dst = published (public) address</td><td>172.16.20.20, eth3 DMZ se</td></tr>
</table>

<h3>Translated addresses routable hone chahiye</h3>
<p>NAT packet ko naya address deta hai, lekin use deliver bhi karna padta hai. Agar aap kisi address mein translate karte ho, to engine ki routing table aur next router ko use reach karna aana chahiye, aur wapsi mein return packets engine tak aane chahiye. Typical failures: translated destination 172.16.20.20 kisi engine network par nahi aur route nahi hai; ya translated source aisa address hai jo ISP aapko route nahi karta, isliye replies kabhi wapas nahi aate. Engines page mein engine ka Routing view kholo aur check karo ki translated address cover hota hai.</p>

<div class="eg"><p><b>Worked example.</b> DMZ publication kaam nahi kar raha. Timeline par chalo. Step 1: kya koi Access rule published address ko HTTP ke saath allow karta hai? Logs dekho: connection last rule se discard hai, yaani nahi. Access destination fix karo. Dobara test: ab allowed hai par timeout. Step 2: kya koi destination NAT rule public address aur HTTP par match karta hai? Haan. Step 3: kya engine 172.16.20.20 route karta hai? Woh eth3 par hai, haan. Last check: kya Install policy kiya? Install policy bar pending changes dikhata hai, yaani nahi. Install karo; page load ho gaya. Chaar sawaal, order mein, do faults mil gaye.</p></div>

<h3>Logs page se diagnose karo</h3>
<pre class="out">Time      Rule   Action     Src            Dst            Svc
10:02:11  7      Discard    198.51.100.77  203.0.113.10   HTTP
10:05:40  4      Allow      198.51.100.77  203.0.113.10   HTTP
<span class="hl">Rule 4 PUBLIC destination par match hua, yaani Access rule sahi hai</span></pre>
<p>Yeh sample output illustrative hai. Pehle rule number padho: agar woh implicit discard ya broad neeche wala rule hai, to aapka Access rule original addresses se match nahi hua. Agar rule sahi hai par page phir bhi fail hai, to NAT aur routing par jao.</p>

<h3>NAT list ke andar order</h3>
<p>Chapter 1 yaad karo: specific upar, general neeche, no-NAT exceptions sabse upar. Shadowing check karo: source any, destination any wala broad dynamic NAT rule agar pehle ho to sab kuch pakad leta hai, aur baad ke rules kabhi match nahi karte. Editor aise rules ke baare mein warning deta hai jo kabhi match nahi honge; warnings Install ko block nahi karte, isliye unhe padho.</p>

<div class="warn"><p><b>Common mistake.</b> Access check karne se pehle NAT debug karna. Agar Logs mein Discard dikh raha hai to NAT wajah nahi hai. Ek aur: yeh maan lena ki reply ko alag Access rule chahiye. Allowed, tracked connection ke replies connection handle karta hai, rule nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Access rule kaunsa address dekhta hai" wale sawaal. Jawab hai original address, kisi translation se pehle. Release-specific behaviour ke liye apne NGFW version ki documentation check karo.</p></div>

<div class="scn"><h4>Woh route jo kisi ne add nahi kiya</h4><p>Ek engineer ne guest subnet ko alag public address block mein translate kiya, lekin ISP ne Pune ko sirf WAN address route kiya tha. Guests browse karte rahe, packets nikle, par reply nahi aaya. ISP side ke capture mein dikha ki replies aise address par bheje ja rahe the jo kisi ka nahi tha. Unhone NAT rule ko interface-ip par switch kiya, install kiya, aur traffic wapas aane laga.</p><p><b>Lesson:</b> translated source address tabhi kaam ka hai jab Internet us par replies route kar sake.</p></div>

<div class="iv"><p class="q">"Firewall access policy NAT se pehle check karta hai ya baad mein?"</p><p>Strong answer: Access rules pehle check hote hain, original addresses par. NAT baad mein lagta hai, sirf allowed connections par, aur routing se pehle. Isliye published server ko apne public address ke liye Access rule chahiye. Troubleshooting order batao: Access, NAT, routing, install.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Access rules, phir NAT, phir routing.</li>
<li>Access rules hamesha original, pre-NAT addresses dekhte hain.</li>
<li>Access rules mein discard connection ko NAT se pehle rok deta hai.</li>
<li>Translated addresses dono taraf routable hone chahiye.</li>
<li>Logs ke rule numbers se decide karo ki fault Access, NAT ya routing mein hai.</li>
</ul></div>
`}};export{e as default};