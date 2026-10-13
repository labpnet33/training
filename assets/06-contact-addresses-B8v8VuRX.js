var e={id:`contact`,h:{en:`Contact addresses and Locations`,hi:`Contact addresses aur Locations`},body:{en:`
<p>The SMC and an engine must talk to each other all the time: the engine sends status and logs, the SMC sends policy and commands. Both directions need an address that really works. When both sides are on the same private network this is easy. When something in the middle changes the address (NAT, or a different site), the SMC needs a <b>contact address</b>. This chapter explains it and prepares lab 4, where an engine loses contact after an interface change.</p>

<h3>Analogy: the postal address and the courier address</h3>
<p>Your friend lives in a gated society. Inside the society everyone knows him as "Flat 12, Block B". A courier from outside the society cannot use that, the courier needs "Block B, Society Gate 2, MG Road". The inside name works only inside. The outside name works from outside. In the SMC world, the first is the engine primary (control) IP address and the second is its <b>contact address</b>.</p>

<h3>Locations</h3>
<p>A <b>Location</b> is an SMC element that groups components that can reach each other on their real addresses. In our simulator there is one Location for the SMC side and one for the engine (the Pune branch), so the model is: SMC in one Location, engine in another. Components in the <b>same Location</b> use the normal control IP. Components in a <b>different Location</b> use a contact address instead.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="SMC and engine in different Locations">
<rect x="15" y="20" width="240" height="210" rx="12" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="135" y="44" text-anchor="middle" class="svg-ink" font-size="13">Location: Head office</text>
<rect x="55" y="90" width="160" height="60" rx="10" fill="#bae6fd"/><text x="135" y="116" text-anchor="middle" class="svg-ink" font-size="13">NK-SMC</text><text x="135" y="136" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10</text>
<rect x="385" y="20" width="240" height="210" rx="12" fill="#bbf7d0" opacity="0.6" stroke="#64748b"/><text x="505" y="44" text-anchor="middle" class="svg-ink" font-size="13">Location: Pune branch</text>
<rect x="425" y="90" width="160" height="60" rx="10" fill="#fde68a"/><text x="505" y="116" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="505" y="136" text-anchor="middle" class="svg-muted" font-size="12">control IP 10.0.0.1</text>
<line x1="215" y1="120" x2="425" y2="120" stroke="#64748b" stroke-width="3"/>
<text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">SMC dials the</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">contact address</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">engine dials the SMC on tcp 8902</text>
</svg><p class="cap">Different Locations: the SMC uses the engine contact address, not the control IP.</p></div>

<h3>Which address does the SMC pick?</h3>
<ol>
<li>Same Location: the primary (control) IP address.</li>
<li>Different Location: the Location-specific contact address, if one is defined for the viewer's Location.</li>
<li>Otherwise the element Default contact address.</li>
<li>If neither exists, the untranslated address.</li>
</ol>
<table class="cmp"><tr><th>Kind</th><th>When used</th></tr>
<tr><td>Control IP</td><td>Communication inside one Location</td></tr>
<tr><td>Location-specific contact address</td><td>Used by components in that other Location</td></tr>
<tr><td>Default contact address</td><td>Fallback for any other Location</td></tr></table>

<h3>How the engine reaches the SMC</h3>
<p>The engine opens a connection to the SMC on TCP port 8902, and the SMC opens connections back to the engine. An engine is shown as Online only if both work: the engine reaches the SMC, and the SMC reaches the engine on the right address. Dynamic engine addresses and extra NAT in between can need node-initiated contact; that is not modelled here (check the documentation for your NGFW version).</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-FW has control IP 10.0.0.1 and sits in Location Pune branch. NK-SMC sits in Location Head office. Because the Locations differ, the SMC dials the contact address of the engine for Head office: let us say 10.0.0.1 too, because the lab network is flat. Now an engineer renumbers the control interface to 10.0.0.2 but does not touch the contact address. The SMC still dials 10.0.0.1. Nothing answers, the engine turns to Unknown, and Install policy is blocked with a no-contact error. The engine itself is healthy and carries traffic.</p></div>

<h3>Symptoms and diagnosis</h3>
<p>Think about what changed. A good checklist: (1) Which interface did the last change touch? (2) Is it the control interface? (3) What contact address is defined for the engine? Does it still match the real control address? (4) Is the engine in a different Location? If so, the contact address decides everything.</p>
<pre class="out">NK-PUNE-FW   status: <span class="hl">Unknown</span> (no contact)
  control IP        10.0.0.2   (changed today)
  contact (default) <span class="hl">10.0.0.1</span>   (stale)
  SMC Location      Head office
  Engine Location   Pune branch</pre>
<p>The fix is to correct the contact address so that it points to the address the engine really has, then confirm that the status returns to a known state. Follow the lab task for the order of steps, and remember that all configuration changes reach the engine only after Install policy.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing the control interface and forgetting the contact address. Defining the contact address on the wrong Location. Thinking that a contact address changes the engine interfaces; it does not, it only tells the SMC where to call. Assuming that a healthy traffic path means a healthy management path.</p></div>
<div class="exam"><p><b>Exam trap.</b> A contact address is the translated address of an SMC component as seen from another Location. If both components are in the same Location, the contact address is not used at all. Order of choice: Location-specific, then default, then untranslated.</p></div>

<div class="scn"><h4>The engine that went Unknown after a renumber</h4><p>During a branch IP renumbering, the engineer changed the control interface of the engine. Within a minute the SMC showed Unknown, and policy installs failed. Traffic at the branch kept flowing, which proved the engine was alive. The engineer saw that the engine element still had the old address as its contact address. After correcting it, the engine returned to a normal status and the pending policy could be installed.</p><p><b>Lesson:</b> whenever the control interface changes, update the contact address in the same maintenance window, and know in which Location the engine sits.</p></div>

<div class="iv"><p class="q">"The firewall passes traffic but the SMC shows it as unreachable. What do you check?"</p><p>First separate the planes: traffic is fine, management is broken. Check whether the control interface address changed, whether the contact address is stale, which Location each component is in, and whether TCP 8902 is allowed in both directions on the path. Do not touch the access rules until you know which address the SMC dials.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A contact address is the address another Location must use to reach an SMC component.</li>
<li>Same Location uses the control IP; different Location uses Location-specific, then default contact address.</li>
<li>After a control interface change, check the contact address first.</li>
<li>Unknown status with healthy traffic points to management reachability.</li>
<li>No contact with a node blocks Install policy.</li>
</ul></div>
`,hi:`
<p>SMC aur engine ko hamesha ek dusre se baat karni padti hai: engine status aur logs bhejta hai, SMC policy aur commands bhejta hai. Dono directions ke liye aisa address chahiye jo sach mein kaam kare. Jab dono sides same private network par hon to yeh aasan hai. Jab beech mein kuch address badal de (NAT, ya alag site), tab SMC ko <b>contact address</b> chahiye. Yeh chapter use samjhata hai aur lab 4 ki taiyari karta hai, jahan interface change ke baad engine contact kho deta hai.</p>

<h3>Analogy: postal address aur courier address</h3>
<p>Aapka dost ek gated society mein rehta hai. Society ke andar sab use "Flat 12, Block B" ke naam se jaante hain. Society ke bahar se aane wala courier yeh use nahi kar sakta, use chahiye "Block B, Society Gate 2, MG Road". Andar wala naam sirf andar kaam karta hai. Bahar wala naam bahar se kaam karta hai. SMC ki duniya mein pehla engine ka primary (control) IP address hai aur doosra uska <b>contact address</b>.</p>

<h3>Locations</h3>
<p><b>Location</b> ek SMC element hai jo un components ko group karta hai jo apne asli addresses par ek dusre tak pahunch sakte hain. Hamare simulator mein SMC side ke liye ek Location hai aur engine (Pune branch) ke liye ek, isliye model hai: SMC ek Location mein, engine doosre mein. <b>Same Location</b> ke components normal control IP use karte hain. <b>Alag Location</b> ke components uski jagah contact address use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Alag Locations mein SMC aur engine">
<rect x="15" y="20" width="240" height="210" rx="12" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="135" y="44" text-anchor="middle" class="svg-ink" font-size="13">Location: Head office</text>
<rect x="55" y="90" width="160" height="60" rx="10" fill="#bae6fd"/><text x="135" y="116" text-anchor="middle" class="svg-ink" font-size="13">NK-SMC</text><text x="135" y="136" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10</text>
<rect x="385" y="20" width="240" height="210" rx="12" fill="#bbf7d0" opacity="0.6" stroke="#64748b"/><text x="505" y="44" text-anchor="middle" class="svg-ink" font-size="13">Location: Pune branch</text>
<rect x="425" y="90" width="160" height="60" rx="10" fill="#fde68a"/><text x="505" y="116" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="505" y="136" text-anchor="middle" class="svg-muted" font-size="12">control IP 10.0.0.1</text>
<line x1="215" y1="120" x2="425" y2="120" stroke="#64748b" stroke-width="3"/>
<text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">SMC dial karta hai</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">contact address</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">engine SMC ko tcp 8902 par dial karta hai</text>
</svg><p class="cap">Alag Locations: SMC engine ka contact address use karta hai, control IP nahi.</p></div>

<h3>SMC kaunsa address chunta hai?</h3>
<ol>
<li>Same Location: primary (control) IP address.</li>
<li>Alag Location: Location-specific contact address, agar dekhne wale ke Location ke liye define ho.</li>
<li>Warna element ka Default contact address.</li>
<li>Dono na ho to untranslated address.</li>
</ol>
<table class="cmp"><tr><th>Kism</th><th>Kab use hota hai</th></tr>
<tr><td>Control IP</td><td>Ek Location ke andar communication</td></tr>
<tr><td>Location-specific contact address</td><td>Us doosre Location ke components use karte hain</td></tr>
<tr><td>Default contact address</td><td>Kisi bhi aur Location ke liye fallback</td></tr></table>

<h3>Engine SMC tak kaise pahunchta hai</h3>
<p>Engine SMC ko TCP port 8902 par connection kholta hai, aur SMC engine ki taraf wapas connections kholta hai. Engine tabhi Online dikhta hai jab dono kaam karein: engine SMC tak pahunche, aur SMC engine tak sahi address par pahunche. Dynamic engine addresses aur beech mein extra NAT ke liye node-initiated contact chahiye ho sakta hai; yahan woh model nahi hai (apne NGFW version ki documentation check karo).</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-FW ka control IP 10.0.0.1 hai aur woh Location Pune branch mein hai. NK-SMC Location Head office mein hai. Locations alag hain, isliye SMC Head office ke liye engine ka contact address dial karta hai: maan lo woh bhi 10.0.0.1 hai, kyunki lab network flat hai. Ab ek engineer control interface ko 10.0.0.2 renumber karta hai lekin contact address ko haath nahi lagata. SMC phir bhi 10.0.0.1 dial karta hai. Koi jawab nahi deta, engine Unknown ho jata hai, aur Install policy no-contact error se block ho jati hai. Engine khud theek hai aur traffic carry karta hai.</p></div>

<h3>Symptoms aur diagnosis</h3>
<p>Socho kya badla. Achhi checklist: (1) Aakhri change ne kaunsa interface chhua? (2) Kya woh control interface hai? (3) Engine ke liye kaunsa contact address define hai? Kya woh ab bhi asli control address se match karta hai? (4) Kya engine alag Location mein hai? Agar haan, to contact address sab kuch decide karta hai.</p>
<pre class="out">NK-PUNE-FW   status: <span class="hl">Unknown</span> (no contact)
  control IP        10.0.0.2   (changed today)
  contact (default) <span class="hl">10.0.0.1</span>   (stale)
  SMC Location      Head office
  Engine Location   Pune branch</pre>
<p>Fix yeh hai ki contact address ko usi address par correct karo jo engine ke paas asal mein hai, phir confirm karo ki status known state mein wapas aaya. Steps ke order ke liye lab task follow karo, aur yaad rakho ki saare configuration changes engine tak sirf Install policy ke baad pahunchte hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Control interface badalna aur contact address bhool jana. Contact address ko galat Location par define karna. Sochna ki contact address engine interfaces badal deta hai; woh nahi badalta, woh sirf SMC ko batata hai kahan call karna hai. Maan lena ki traffic path theek hai to management path bhi theek hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Contact address kisi SMC component ka translated address hai jaisa doosre Location se dikhta hai. Agar dono components same Location mein hain, to contact address use hi nahi hota. Chunne ka order: Location-specific, phir default, phir untranslated.</p></div>

<div class="scn"><h4>Renumber ke baad Unknown hua engine</h4><p>Branch IP renumbering ke dauran engineer ne engine ka control interface badla. Ek minute ke andar SMC ne Unknown dikhaya aur policy installs fail hone lage. Branch par traffic chalta raha, jisse saabit hua ki engine zinda hai. Engineer ne dekha ki engine element mein contact address ke roop mein ab bhi purana address hai. Use correct karne ke baad engine normal status par wapas aaya aur pending policy install ho saki.</p><p><b>Lesson:</b> jab bhi control interface badle, usi maintenance window mein contact address update karo, aur jaano ki engine kis Location mein hai.</p></div>

<div class="iv"><p class="q">"Firewall traffic pass karta hai lekin SMC use unreachable dikhata hai. Kya check karoge?"</p><p>Pehle planes alag karo: traffic theek hai, management toota hai. Check karo ki control interface address badla ya nahi, contact address stale hai ya nahi, har component kis Location mein hai, aur kya TCP 8902 path par dono directions mein allowed hai. Jab tak pata na ho SMC kaunsa address dial kar raha hai, access rules ko mat chhedo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Contact address woh address hai jo doosre Location ko SMC component tak pahunchne ke liye use karna hai.</li>
<li>Same Location control IP use karta hai; alag Location Location-specific, phir default contact address use karta hai.</li>
<li>Control interface change ke baad sabse pehle contact address check karo.</li>
<li>Traffic theek ho aur status Unknown ho to management reachability ki taraf dekho.</li>
<li>Node se no contact hone par Install policy block hoti hai.</li>
</ul></div>
`}};export{e as default};