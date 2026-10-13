var e={id:`objects-in-an-adom`,h:{en:`Objects in an ADOM: one definition for many devices`,hi:`ADOM ke objects: kai devices ke liye ek definition`},body:{en:`
<div class="note"><p><b>What you will learn.</b> What an object is in FortiManager, why an address object is defined once in the ADOM instead of on every FortiGate, how to create one with <code>config pm address</code>, and how FortiManager decides which objects reach which device. <b>Prerequisites:</b> the module fmg-start (devices are authorized in the ADOM Kaveri) and FortiGate basics: you know what an address object and a firewall policy are.</p></div>

<p>Think of a school with three branches. The principal says "the library is at the end of the corridor" and writes it on one master map. Every branch prints the same map. If the library moves, the principal edits the master map once and reprints. Without a master map, each branch draws its own and soon the three maps disagree. In FortiManager, the master map is the set of <b>objects</b> stored in the ADOM.</p>

<h3>What an object is</h3>
<p>An <b>object</b> is a named building block that firewall policies refer to. The most common one is the <b>address object</b>: a name for an IP address or subnet. Instead of typing 192.0.2.80 inside ten policies, you create an object called SRV-WEB (the intranet web server) and write SRV-WEB in each policy. Other kinds of objects exist (services, schedules, profiles), but in this course we work with address objects and interfaces.</p>
<p>On a single FortiGate, objects live in that device. In FortiManager they live in the <b>ADOM database</b> (see fmg-start, chapter 2), so every device in the ADOM can use them. This is the key idea of the whole module: <b>define once, use on many devices</b>.</p>

<h3>Step by step: from object to device</h3>
<ol>
<li>You create the object in the ADOM. FortiManager stores it; nothing is sent to any FortiGate yet.</li>
<li>You use the object in a policy inside a policy package (chapter 3).</li>
<li>When you install the package to a device (chapter 4), FortiManager copies the objects that the policies use to that device, then the policies.</li>
</ol>
<p>Notice step 3: only objects that a policy really uses are installed. An address object nobody refers to stays in FortiManager and does not clutter the branch FortiGate. Built-in names such as <code>all</code> and <code>none</code> are always available and are not copied.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="One address object in the ADOM used by three devices">
<rect x="215" y="14" width="210" height="62" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">ADOM Kaveri</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">SRV-WEB 192.0.2.80/32</text>
<rect x="30" y="140" width="150" height="50" rx="8" fill="#bae6fd"/><text x="105" y="170" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text>
<rect x="245" y="140" width="150" height="50" rx="8" fill="#bae6fd"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text>
<rect x="460" y="140" width="150" height="50" rx="8" fill="#bae6fd"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text>
<line x1="270" y1="76" x2="105" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="76" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="370" y1="76" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="150" y="104" class="svg-accent" font-size="12">copied at install</text>
</svg><p class="cap">The object exists once in the ADOM and is copied to each device at install time.</p></div>

<h3>Why it matters</h3>
<p>If the web server gets a new address, you edit one object. Without central objects you would log in to every FortiGate, and one of them would be missed. A missed device keeps the old address and users there silently reach the wrong place. One definition also gives one name everywhere, which makes policies readable and audits easy.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail has the intranet web server SRV-WEB at 192.0.2.80. All three sites need to reach it. You create one address object, name SRV-WEB, subnet 192.0.2.80 with mask 255.255.255.255 (a /32, meaning exactly one host). Three policies, one on each site, refer to this name. The server is later moved to 192.0.2.81: you change one line in FortiManager, install again, and all three sites follow.</p></div>

<h3>Creating the object</h3>
<p>In the real product you click in the GUI. The simulator offers the same database as a CLI table on FMG-1, named after the API path: <code>config pm address</code>. The <code>adom</code> attribute says which ADOM owns the object.</p>
<pre class="code"><span class="c">! on FMG-1</span>
config pm address
    edit "SRV-WEB"
        set adom "Kaveri"
        set subnet 192.0.2.80 255.255.255.255
    next
end</pre>
<p>Check it with <code>show pm address</code>:</p>
<pre class="out">FMG-1 # show pm address
config pm address
    edit "SRV-WEB"
        <span class="hl">set adom "Kaveri"</span>
        <span class="hl">set subnet 192.0.2.80 255.255.255.255</span>
    next
end</pre>
<p>The object now exists in FortiManager only. Look at a branch FortiGate and you will find no SRV-WEB there until a package that uses it is installed.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the <code>adom</code> attribute, so the object does not belong to the ADOM where the package is. (2) Using a mask of 255.255.255.0 for a single host and so allowing a whole subnet. (3) Creating the object on the FortiGate and expecting FortiManager to know it; FortiManager only knows what is in its ADOM database or what you import (chapter 5). (4) Typing the name differently in the policy (SRV-Web instead of SRV-WEB): the install then fails because the object is not found.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Where is an address object stored?" In the ADOM database, not in the device database. "Is it sent when created?" No, only at install, and only if a policy uses it. Names are case sensitive in practice, so match them exactly.</p></div>

<div class="scn"><h4>Three sites, three different web server addresses</h4><p>After a server move, a retailer edited the address object on two of three FortiGates by hand. At the third site the old object stayed, and staff there reached an old test server for two days, with no error message. The team moved the object into the ADOM, referred to it in the package, and installed to all three. The next move was one edit.</p><p><b>Lesson:</b> an object that exists in many places will eventually differ; an object that exists once cannot.</p></div>

<div class="iv"><p class="q">"Why create address objects in FortiManager and not on each FortiGate?"</p><p>One definition for many devices removes drift and saves time. The objects live in the ADOM database, and an install copies to each device only the objects that its policies use. Add that built-in names such as all are not copied, and that a name typed differently in a policy causes an install failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An object is a named building block; the address object names an IP or subnet.</li>
<li>Objects live in the ADOM database and are defined once for all devices of the ADOM.</li>
<li>In the simulator the table is <code>config pm address</code>, with the attribute <code>adom</code>.</li>
<li>Creating an object sends nothing; an install copies only the objects that policies use.</li>
<li>A name that does not match exactly makes the install fail with an object-not-found message.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> FortiManager mein object kya hota hai, address object ADOM mein ek baar kyun define karte hain aur har FortiGate par kyun nahi, <code>config pm address</code> se ek kaise banate hain, aur FortiManager kaise decide karta hai ki kaun sa object kis device tak jaye. <b>Prerequisites:</b> module fmg-start (devices ADOM Kaveri mein authorized hain) aur FortiGate basics: aap jaante ho address object aur firewall policy kya hoti hai.</p></div>

<p>Socho ek school ki teen branches hain. Principal kehta hai "library corridor ke end par hai" aur ek master map par likh deta hai. Har branch wahi map print karti hai. Library shift ho to principal master map ek baar edit karke dobara print karwata hai. Master map ke bina har branch apna map banati hai aur jaldi teeno alag ho jate hain. FortiManager mein master map ADOM mein stored <b>objects</b> ka set hai.</p>

<h3>Object kya hota hai</h3>
<p><b>Object</b> ek named building block hai jise firewall policies refer karti hain. Sabse common <b>address object</b> hai: IP address ya subnet ka naam. Das policies mein 192.0.2.80 type karne ke bajay aap SRV-WEB (intranet web server) naam ka object banate ho aur har policy mein SRV-WEB likhte ho. Aur bhi objects hote hain (services, schedules, profiles), par is course mein hum address objects aur interfaces ke saath kaam karte hain.</p>
<p>Ek single FortiGate par objects usi device mein rehte hain. FortiManager mein ye <b>ADOM database</b> mein rehte hain (fmg-start, chapter 2 dekho), isliye ADOM ka har device inhe use kar sakta hai. Poore module ka key idea yahi hai: <b>ek baar define karo, kai devices par use karo</b>.</p>

<h3>Step by step: object se device tak</h3>
<ol>
<li>Aap ADOM mein object banate ho. FortiManager use store karta hai; abhi kisi FortiGate ko kuch nahi bheja jata.</li>
<li>Aap object ko policy package ke andar ek policy mein use karte ho (chapter 3).</li>
<li>Package ko device par install karte ho (chapter 4) to FortiManager pehle un objects ko device par copy karta hai jo policies use karti hain, phir policies.</li>
</ol>
<p>Step 3 dhyan se dekho: sirf wahi objects install hote hain jo koi policy sach mein use karti hai. Jis address object ko koi refer nahi karta wo FortiManager mein hi rehta hai aur branch FortiGate ko clutter nahi karta. <code>all</code> aur <code>none</code> jaise built-in names hamesha available hain aur copy nahi hote.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ADOM ka ek address object teen devices use karte hain">
<rect x="215" y="14" width="210" height="62" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">ADOM Kaveri</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">SRV-WEB 192.0.2.80/32</text>
<rect x="30" y="140" width="150" height="50" rx="8" fill="#bae6fd"/><text x="105" y="170" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text>
<rect x="245" y="140" width="150" height="50" rx="8" fill="#bae6fd"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text>
<rect x="460" y="140" width="150" height="50" rx="8" fill="#bae6fd"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text>
<line x1="270" y1="76" x2="105" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="76" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="370" y1="76" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="150" y="104" class="svg-accent" font-size="12">install par copy</text>
</svg><p class="cap">Object ADOM mein ek baar rehta hai aur install ke time har device par copy hota hai.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Web server ka naya address aaye to aap ek object edit karte ho. Central objects ke bina har FortiGate mein login karna padta aur ek zaroor chhoot jata. Chhoota hua device purana address rakhta hai aur wahan ke users bina kisi error ke galat jagah pahunchte hain. Ek definition ka matlab har jagah ek naam, jisse policies padhna aur audit karna aasaan hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail ka intranet web server SRV-WEB 192.0.2.80 par hai. Teeno sites ko use reach karna hai. Aap ek address object banate ho, naam SRV-WEB, subnet 192.0.2.80, mask 255.255.255.255 (/32, yaani exactly ek host). Har site ki ek policy is naam ko refer karti hai. Baad mein server 192.0.2.81 par shift hota hai: FortiManager mein ek line badalte ho, dobara install karte ho, aur teeno sites follow karti hain.</p></div>

<h3>Object banana</h3>
<p>Real product mein aap GUI mein click karte ho. Simulator wahi database FMG-1 par CLI table ki tarah deta hai, jiska naam API path se aata hai: <code>config pm address</code>. Attribute <code>adom</code> batata hai object kis ADOM ka hai.</p>
<pre class="code"><span class="c">! on FMG-1</span>
config pm address
    edit "SRV-WEB"
        set adom "Kaveri"
        set subnet 192.0.2.80 255.255.255.255
    next
end</pre>
<p><code>show pm address</code> se check karo:</p>
<pre class="out">FMG-1 # show pm address
config pm address
    edit "SRV-WEB"
        <span class="hl">set adom "Kaveri"</span>
        <span class="hl">set subnet 192.0.2.80 255.255.255.255</span>
    next
end</pre>
<p>Object ab sirf FortiManager mein hai. Branch FortiGate dekho to wahan SRV-WEB nahi milega jab tak use use karne wala package install na ho.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>adom</code> attribute bhool jana, to object us ADOM ka nahi hota jahan package hai. (2) Single host ke liye mask 255.255.255.0 use karna aur poora subnet allow kar dena. (3) Object FortiGate par banakar sochna ki FortiManager jaanta hai; FortiManager sirf wahi jaanta hai jo uske ADOM database mein ho ya jo aap import karo (chapter 5). (4) Policy mein naam alag type karna (SRV-WEB ki jagah SRV-Web): tab install fail hota hai kyunki object nahi milta.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Address object kahan stored hota hai?" ADOM database mein, device database mein nahi. "Banate hi bheja jata hai?" Nahi, sirf install par, aur sirf agar koi policy use kare. Naam practically case sensitive hote hain, isliye exactly match karo.</p></div>

<div class="scn"><h4>Teen sites, web server ke teen alag addresses</h4><p>Server move ke baad ek retailer ne teen mein se do FortiGates par object haath se edit kiya. Teesri site par purana object raha, aur wahan ke staff do din purane test server tak pahunchte rahe, bina kisi error message ke. Team ne object ko ADOM mein rakha, package mein refer kiya, aur teeno par install kiya. Agli baar move sirf ek edit tha.</p><p><b>Lesson:</b> jo object kai jagah ho wo kabhi na kabhi alag ho jata hai; jo ek jagah ho wo nahi hota.</p></div>

<div class="iv"><p class="q">"Address objects FortiManager mein kyun banate ho, har FortiGate par kyun nahi?"</p><p>Kai devices ke liye ek definition drift hatati hai aur time bachati hai. Objects ADOM database mein rehte hain, aur install har device par sirf wahi objects copy karta hai jo uski policies use karti hain. Ye bhi jodo ki all jaise built-in names copy nahi hote, aur policy mein alag type kiya naam install failure deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Object ek named building block hai; address object IP ya subnet ko naam deta hai.</li>
<li>Objects ADOM database mein rehte hain aur ADOM ke saare devices ke liye ek baar define hote hain.</li>
<li>Simulator mein table <code>config pm address</code> hai, attribute <code>adom</code> ke saath.</li>
<li>Object banane se kuch nahi bheja jata; install sirf wahi objects copy karta hai jo policies use karti hain.</li>
<li>Naam match na ho to install object-not-found message ke saath fail hota hai.</li>
</ul></div>
`}};export{e as default};