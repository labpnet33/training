var e={id:`anatomy`,h:{en:`Rule anatomy: what one access rule says`,hi:`Rule anatomy: ek access rule kya bolta hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how an NGFW engine decides what to do with every new connection: how an Access rule is built, how the engine reads the rules from top to bottom, how templates and sub-policies share rules between branches, how counters and logs prove which rule matched, how users and time ranges change a match, and how the install step validates your work. You will practise this on the Pune branch in five labs. This is independent training based on published documentation; it does not claim to cover any certification exam. Tagline: click-ops, but you understand what each click does.</p>
<p><b>Prerequisites.</b> You should know what an IP address, a subnet and a port are, and you should have finished the first two modules of this track (adding the engine and making first contact, and interfaces and routing). You also need the element set from module one: <code>net-staff</code> 10.1.1.0/24, <code>net-dmz</code> 172.16.20.0/24, <code>srv-web</code> 172.16.20.20 and <code>srv-smc</code> 10.0.0.10.</p>

<h3>Start with an analogy: the gate-pass register</h3>
<p>Think of the security desk at the Network Kings Pune branch building. The guard has a register. Each line says: who is coming (source), where they want to go (destination), what they want to do (service), and what the guard should do about it (action). The guard reads the lines from the top. The first line that fits the visitor is the one the guard follows. If no line fits, the guard sends the visitor away. An <b>Access policy</b> is that register, and the NGFW engine is the guard who never gets tired.</p>

<h3>The five questions every rule asks</h3>
<p>An Access rule is a row in the policy. The management server (SMC) stores it; the engine uses it only after you install the policy. The columns decide <b>which connections match</b>, and the remaining options decide <b>what happens to a match</b>.</p>
<table class="cmp"><tr><th>Part</th><th>Question it answers</th><th>Example</th></tr>
<tr><td><b>Source</b></td><td>Who starts the connection?</td><td><code>net-staff</code></td></tr>
<tr><td><b>Destination</b></td><td>Where is it going?</td><td><code>srv-web</code></td></tr>
<tr><td><b>Service</b></td><td>Which protocol and port?</td><td><code>HTTPS</code></td></tr>
<tr><td><b>Action</b></td><td>What does the engine do?</td><td>Allow</td></tr>
<tr><td><b>Options</b></td><td>Log, inspect, VPN, authenticate, time</td><td>Stored, deep inspection off</td></tr>
</table>
<p>The word <code>any</code> means "no restriction in this column". A rule with source any, destination any and service any matches every connection. You will meet the danger of that later in this module.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="One access rule as a row">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="65" y="58" text-anchor="middle" class="svg-muted" font-size="12">net-staff</text>
<rect x="130" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="185" y="40" text-anchor="middle" class="svg-ink" font-size="13">Destination</text><text x="185" y="58" text-anchor="middle" class="svg-muted" font-size="12">srv-web</text>
<rect x="250" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="305" y="40" text-anchor="middle" class="svg-ink" font-size="13">Service</text><text x="305" y="58" text-anchor="middle" class="svg-muted" font-size="12">HTTPS</text>
<rect x="370" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="425" y="40" text-anchor="middle" class="svg-ink" font-size="13">Action</text><text x="425" y="58" text-anchor="middle" class="svg-muted" font-size="12">Allow</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Options</text><text x="560" y="58" text-anchor="middle" class="svg-muted" font-size="12">log, inspect, auth</text>
<text x="240" y="100" text-anchor="middle" class="svg-accent" font-size="13">match columns: all must fit</text>
<line x1="10" y1="108" x2="360" y2="108" stroke="#64748b"/>
<text x="425" y="100" text-anchor="middle" class="svg-accent" font-size="13">result</text>
<line x1="370" y1="108" x2="630" y2="108" stroke="#64748b"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">A connection matches only when source, destination and service all fit</text>
</svg><p class="cap">The first three columns decide whether the rule matches. Action and options decide what happens next.</p></div>

<h3>The five actions</h3>
<ul>
<li><b>Allow</b>: the connection is permitted and tracked.</li>
<li><b>Discard</b>: the engine drops the packets silently. The sender gets no answer and waits until it times out.</li>
<li><b>Refuse</b>: the engine drops the connection and tells the sender, with a reset for TCP or an unreachable message. The client fails fast.</li>
<li><b>Continue</b>: the rule does not decide the connection. It only sets default values (for example the log level) for the rules below it, and matching goes on.</li>
<li><b>Jump</b>: send the connection into a sub-policy. If nothing matches there, matching returns to the calling policy.</li>
</ul>

<h3>Options on a rule</h3>
<p><b>Logging</b> sets how much is recorded. <b>Inspection</b> options turn on deep inspection or HTTPS decryption for that rule. <b>VPN</b> says whether matching traffic is sent into a tunnel. <b>Authentication</b> requires a logged-in user of a named group. <b>Time</b> limits the rule to a time range. Each gets its own chapter or module; here you only need to know where they live: on the rule, not in a separate place.</p>

<div class="eg"><p><b>Worked example.</b> The rule is: source <code>net-staff</code>, destination <code>srv-web</code>, service <code>HTTPS</code>, action Allow. STAFF-PC (10.1.1.10) opens HTTPS to 172.16.20.20: all three columns fit, so Allow applies. STAFF-PC tries SSH to the same server: the service column does not fit, so this rule is skipped and the engine reads the next rule. A host in the DMZ opening HTTPS to the staff LAN does not fit either, because the source is wrong.</p></div>

<h3>Where you work in the console</h3>
<p>Open the Policies page, pick the policy, and use the rule editor to add a row. Rules are saved in the SMC database only. Nothing reaches the engine until the Install policy bar is used. This install boundary appears in every lab of this module, and every lab passes only after install.</p>

<div class="warn"><p><b>Common mistake.</b> Editing a rule, seeing it saved, and testing traffic at once. The engine still runs the old installed policy. Always install, then test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discard and Refuse both stop the connection. The difference is the reply: Discard is silent, Refuse answers the client. Continue and Jump never end a connection by themselves.</p></div>

<div class="scn"><h4>The rule that was saved but not live</h4><p>A Pune admin added an Allow rule for staff to the web server and told the helpdesk it was done. STAFF-PC still could not connect. The admin opened the Policies page and the rule was there. The Install policy bar showed pending changes. After installing, the connection worked on the next attempt.</p><p><b>Lesson:</b> the SMC holds the plan, the engine runs the installed copy. Saved is not live.</p></div>
<div class="iv"><p class="q">"What are the parts of an access rule and what are the possible actions?"</p><p>A strong answer lists source, destination and service as match columns, then the action (Allow, Discard, Refuse, Continue, Jump) and options for logging, inspection, VPN, authentication and time. Add that Continue and Jump do not end a connection, and that nothing is live until install.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule matches when source, destination and service all fit; any means no restriction.</li>
<li>Actions: Allow, Discard (silent), Refuse (answers), Continue (sets defaults), Jump (sub-policy).</li>
<li>Options on the rule cover logging, inspection, VPN, authentication and time.</li>
<li>Edits live in the SMC until Install policy copies them to the engine.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki NGFW engine har nayi connection ke baare mein kaise decide karta hai: Access rule kaise bana hota hai, engine rules ko upar se neeche kaise padhta hai, templates aur sub-policies branches ke beech rules kaise share karte hain, counters aur logs kaise prove karte hain ki kaunsa rule match hua, users aur time ranges match ko kaise badalte hain, aur install step aapke kaam ko kaise validate karta hai. Aap Pune branch par paanch labs mein practice karoge. Yeh published documentation par based independent training hai; yeh kisi certification exam ko cover karne ka claim nahi karta. Tagline: click-ops, but you understand what each click does.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki IP address, subnet aur port kya hote hain, aur is track ke pehle do modules (engine add karna aur first contact, aur interfaces aur routing) complete hone chahiye. Module one ka element set bhi chahiye: <code>net-staff</code> 10.1.1.0/24, <code>net-dmz</code> 172.16.20.0/24, <code>srv-web</code> 172.16.20.20 aur <code>srv-smc</code> 10.0.0.10.</p>

<h3>Analogy se shuru karo: gate-pass register</h3>
<p>Network Kings Pune branch building ke security desk ko socho. Guard ke paas ek register hai. Har line batati hai: kaun aa raha hai (source), kahan jaana chahta hai (destination), kya karna chahta hai (service), aur guard ko kya karna hai (action). Guard lines ko upar se padhta hai. Jo pehli line visitor par fit hoti hai, guard usi ko follow karta hai. Agar koi line fit nahi hoti, guard visitor ko wapas bhej deta hai. <b>Access policy</b> wahi register hai, aur NGFW engine woh guard hai jo kabhi thakta nahi.</p>

<h3>Har rule paanch sawaal poochta hai</h3>
<p>Access rule policy ki ek row hai. Management server (SMC) use store karta hai; engine use tabhi use karta hai jab aap policy install karte ho. Columns decide karte hain ki <b>kaunsi connections match hongi</b>, aur baaki options decide karte hain ki <b>match hone par kya hoga</b>.</p>
<table class="cmp"><tr><th>Part</th><th>Kaunsa sawaal</th><th>Example</th></tr>
<tr><td><b>Source</b></td><td>Connection kaun shuru karta hai?</td><td><code>net-staff</code></td></tr>
<tr><td><b>Destination</b></td><td>Kahan ja raha hai?</td><td><code>srv-web</code></td></tr>
<tr><td><b>Service</b></td><td>Kaunsa protocol aur port?</td><td><code>HTTPS</code></td></tr>
<tr><td><b>Action</b></td><td>Engine kya karta hai?</td><td>Allow</td></tr>
<tr><td><b>Options</b></td><td>Log, inspect, VPN, authenticate, time</td><td>Stored, deep inspection off</td></tr>
</table>
<p><code>any</code> ka matlab hai "is column mein koi restriction nahi". Source any, destination any aur service any wala rule har connection ko match karta hai. Iska khatra aap is module mein aage dekhoge.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek access rule ek row ki tarah">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="65" y="58" text-anchor="middle" class="svg-muted" font-size="12">net-staff</text>
<rect x="130" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="185" y="40" text-anchor="middle" class="svg-ink" font-size="13">Destination</text><text x="185" y="58" text-anchor="middle" class="svg-muted" font-size="12">srv-web</text>
<rect x="250" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="305" y="40" text-anchor="middle" class="svg-ink" font-size="13">Service</text><text x="305" y="58" text-anchor="middle" class="svg-muted" font-size="12">HTTPS</text>
<rect x="370" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="425" y="40" text-anchor="middle" class="svg-ink" font-size="13">Action</text><text x="425" y="58" text-anchor="middle" class="svg-muted" font-size="12">Allow</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Options</text><text x="560" y="58" text-anchor="middle" class="svg-muted" font-size="12">log, inspect, auth</text>
<text x="240" y="100" text-anchor="middle" class="svg-accent" font-size="13">match columns: sab fit hon</text>
<line x1="10" y1="108" x2="360" y2="108" stroke="#64748b"/>
<text x="425" y="100" text-anchor="middle" class="svg-accent" font-size="13">result</text>
<line x1="370" y1="108" x2="630" y2="108" stroke="#64748b"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Connection tabhi match hoti hai jab source, destination aur service teeno fit hon</text>
</svg><p class="cap">Pehle teen columns decide karte hain ki rule match hoga ya nahi. Action aur options decide karte hain ki aage kya hoga.</p></div>

<h3>Paanch actions</h3>
<ul>
<li><b>Allow</b>: connection permit hoti hai aur track hoti hai.</li>
<li><b>Discard</b>: engine packets ko silently drop kar deta hai. Sender ko koi jawab nahi milta aur woh timeout tak wait karta hai.</li>
<li><b>Refuse</b>: engine connection drop karta hai aur sender ko batata hai, TCP ke liye reset ya unreachable message se. Client jaldi fail ho jata hai.</li>
<li><b>Continue</b>: rule connection ka decision nahi leta. Yeh sirf neeche ke rules ke liye default values set karta hai (jaise log level), aur matching aage chalti rehti hai.</li>
<li><b>Jump</b>: connection ko sub-policy mein bhejta hai. Agar wahan kuch match nahi hua, to matching calling policy mein wapas aa jati hai.</li>
</ul>

<h3>Rule ke options</h3>
<p><b>Logging</b> tay karta hai ki kitna record ho. <b>Inspection</b> options us rule ke liye deep inspection ya HTTPS decryption on karte hain. <b>VPN</b> batata hai ki matching traffic tunnel mein jayegi ya nahi. <b>Authentication</b> ek named group ke logged-in user ko zaroori banata hai. <b>Time</b> rule ko time range tak limit karta hai. Har ek ka apna chapter ya module hai; yahan bas yeh jaano ki yeh rule par hi rehte hain, kisi alag jagah nahi.</p>

<div class="eg"><p><b>Worked example.</b> Rule hai: source <code>net-staff</code>, destination <code>srv-web</code>, service <code>HTTPS</code>, action Allow. STAFF-PC (10.1.1.10) 172.16.20.20 par HTTPS kholta hai: teeno columns fit hote hain, to Allow lagta hai. STAFF-PC usi server par SSH try karta hai: service column fit nahi hota, to yeh rule skip hota hai aur engine agla rule padhta hai. DMZ ka host staff LAN par HTTPS kholta hai to woh bhi fit nahi hota, kyunki source galat hai.</p></div>

<h3>Console mein kahan kaam karte hain</h3>
<p>Policies page kholo, policy chuno, aur rule editor se row add karo. Rules sirf SMC database mein save hote hain. Install policy bar use karne tak engine tak kuch nahi pahunchta. Yeh install boundary is module ke har lab mein aati hai, aur har lab install ke baad hi pass hota hai.</p>

<div class="warn"><p><b>Common mistake.</b> Rule edit karna, save dekhna, aur turant traffic test karna. Engine abhi bhi purani installed policy chala raha hai. Hamesha pehle install, phir test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discard aur Refuse dono connection rokte hain. Fark reply ka hai: Discard silent hai, Refuse client ko jawab deta hai. Continue aur Jump akele connection ko end nahi karte.</p></div>

<div class="scn"><h4>Rule saved tha par live nahi tha</h4><p>Pune ke admin ne staff ke liye web server ka Allow rule add kiya aur helpdesk ko bola ki ho gaya. STAFF-PC phir bhi connect nahi ho paa raha tha. Admin ne Policies page kholi aur rule wahan tha. Install policy bar mein pending changes dikh rahe the. Install karne ke baad agli attempt par connection chal gaya.</p><p><b>Lesson:</b> SMC plan rakhta hai, engine installed copy chalata hai. Saved ka matlab live nahi.</p></div>
<div class="iv"><p class="q">"Access rule ke parts kya hain aur possible actions kaunse hain?"</p><p>Strong answer source, destination aur service ko match columns batata hai, phir action (Allow, Discard, Refuse, Continue, Jump) aur logging, inspection, VPN, authentication aur time ke options. Yeh bhi bolo ki Continue aur Jump connection end nahi karte, aur install se pehle kuch live nahi hota.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule tab match karta hai jab source, destination aur service sab fit hon; any ka matlab no restriction.</li>
<li>Actions: Allow, Discard (silent), Refuse (jawab deta hai), Continue (defaults set karta hai), Jump (sub-policy).</li>
<li>Rule ke options mein logging, inspection, VPN, authentication aur time aate hain.</li>
<li>Edits SMC mein rehte hain jab tak Install policy unhe engine tak copy na kare.</li>
</ul></div>
`}};export{e as default};