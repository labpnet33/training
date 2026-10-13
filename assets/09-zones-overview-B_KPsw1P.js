var e={id:`zones-overview`,h:{en:`Zones: trust, untrust and why mapping matters`,hi:`Zones: trust, untrust aur mapping kyun matter karti hai`},body:{en:`
<p>A firewall rule needs to know where traffic comes from and where it goes. In Prisma Access that knowledge comes from <b>zones</b>. This chapter is an overview; the full policy design is in the pa-policy module. But the main idea belongs here, because wrong zone mapping is a common reason that a connected user cannot reach an application.</p>

<h3>Analogy: airport terminals</h3>
<p>An airport has an international hall and a staff-only area. Rules say who can walk from one to the other. Zones are those areas. Prisma Access draws two main areas: <b>Trust</b> for your own internal and data center resources, and <b>Untrust</b> for the internet and SaaS.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trust and untrust zones">
<rect x="20" y="30" width="190" height="110" rx="10" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">Sources</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">mobile users, branches</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="11">mapped zone: untrust by default</text>
<rect x="250" y="30" width="140" height="110" rx="10" fill="#ddd6fe"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">Security rules</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">between zones</text>
<rect x="430" y="20" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Trust</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="11">HQ, data center</text>
<rect x="430" y="95" width="190" height="55" rx="10" fill="#fed7aa"/><text x="525" y="119" text-anchor="middle" class="svg-ink" font-size="13">Untrust</text><text x="525" y="137" text-anchor="middle" class="svg-muted" font-size="11">internet and SaaS</text>
<line x1="210" y1="85" x2="250" y2="85" stroke="#64748b"/><line x1="390" y1="60" x2="430" y2="47" stroke="#64748b"/><line x1="390" y1="110" x2="430" y2="122" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Policy is enforced between trust and untrust</text>
</svg><p class="cap">Destination zone decides whether a flow is private application access or internet access.</p></div>

<h3>What Prisma Access creates</h3>
<p>Prisma Access creates three zones: <b>Trust</b>, <b>Untrust</b> and <b>Clientless VPN</b>. Clientless VPN maps to trust and that cannot be changed. The names trust, untrust, inter-fw and the names of your remote networks are reserved.</p>

<h3>Mapping: the part everyone forgets</h3>
<p>Each connection type has a <b>mapped zone</b>. By default a mapped zone is <b>untrust</b>. If a zone reaches internal or data center resources, you must move it to <b>Trusted Zones</b>. On Panorama this is under Zone Mapping settings; for remote networks it is in <code>Templates &gt; Network &gt; Zones</code>. Rules are enforced between trust and untrust zones.</p>
<table class="cmp"><tr><th>Traffic</th><th>Destination zone</th><th>Meaning</th></tr>
<tr><td>User to a website or SaaS</td><td>untrust</td><td>Internet access</td></tr>
<tr><td>User to 10.10.0.50 at HQ</td><td>trust (after mapping)</td><td>Private application access</td></tr>
<tr><td>Branch to HQ</td><td>trust</td><td>Private application access</td></tr>
</table>

<h3>Rules and best practice</h3>
<p>Use zones, App-ID and security profiles in your rules. The documentation says <b>do not write any-to-any rules</b>. SCM provides default mobile user rules that enforce URL blocking, malware and threat prevention; the documentation suggests verifying them after about 15 minutes. Rules can use users and groups when IP-to-user and user-to-group mapping is available through Cloud Identity Engine or a User-ID master device.</p>
<pre class="out">Zone Mapping (lab console view)
Zone name        Mapped as
data-center      <span class="hl">Trust</span>
branch-delhi     Untrust
Internet         Untrust
</pre>
<p>Here the data-center zone is correctly mapped to Trust. If it said Untrust, a rule that allows traffic to 10.10.0.50 in the trust zone would never match.</p>

<div class="eg"><p><b>Worked example.</b> The administrator writes a rule: source mobile users, destination zone trust, application web-browsing and ssl, action allow. The user connects, opens 10.10.0.50 and gets blocked. The traffic log shows the destination zone as untrust, because the data-center zone was never moved to Trusted Zones. After remapping and pushing, the same flow hits the intended rule. The rule was right; the map was wrong.</p></div>

<h3>A short zone planning checklist</h3>
<ul>
<li>List every network that holds internal resources: HQ 10.10.0.0/24 and the branch LAN 10.20.0.0/24.</li>
<li>Decide which of them must be Trust, and write it down before building rules.</li>
<li>After pushing, send one test flow to an internal address and one to the internet, and read the destination zone in each log line.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaving data center zones as untrust. (2) Writing any-to-any rules to "make it work". (3) Forgetting that a mapping change is also a configuration change that must be pushed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Internet versus private application access follows the <i>destination zone mapping</i>: untrust for internet and SaaS, trust for corporate and data center resources. Also: Clientless VPN is fixed to trust.</p></div>

<div class="scn"><h4>Allowed in the rule, denied in the log</h4><p>Staff reported that the HR portal at HQ would not open although a rule allowed it. The engineer opened the traffic log for the failed session. The matching rule was the default deny at the bottom, and the destination zone was untrust. The HQ zone mapping had been left at its default. Moving the zone to Trusted Zones and pushing fixed it with no rule change.</p><p><b>Lesson:</b> when a rule does not match, read the zones in the log before editing the rule.</p></div>

<div class="iv"><p class="q">"Which zones does Prisma Access create and how do you control them?"</p><p>Strong answer: Trust, Untrust and Clientless VPN. Mapped zones default to untrust; anything that reaches internal or data center resources must be moved to Trusted Zones. Policy is enforced between trust and untrust, so destination zone separates internet access from private application access. Avoid any-to-any rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zones created: Trust, Untrust and Clientless VPN (fixed to trust).</li>
<li>Mapped zones default to untrust; move internal zones to Trusted Zones.</li>
<li>Policy is enforced between trust and untrust zones.</li>
<li>Destination zone separates internet from private application access.</li>
<li>No any-to-any rules; verify default rules after about 15 minutes.</li>
</ul></div>
`,hi:`
<p>Firewall rule ko pata hona chahiye ki traffic kahan se aa raha hai aur kahan ja raha hai. Prisma Access mein yeh jaankari <b>zones</b> se aati hai. Yeh chapter overview hai; poora policy design pa-policy module mein hai. Lekin main idea yahin ka hai, kyunki galat zone mapping connected user ke application tak na pahunchne ki common wajah hai.</p>

<h3>Analogy: airport terminals</h3>
<p>Airport mein international hall aur staff-only area hota hai. Rules batate hain ki ek se doosre mein kaun ja sakta hai. Zones wahi areas hain. Prisma Access do main areas banata hai: <b>Trust</b> aapke apne internal aur data center resources ke liye, aur <b>Untrust</b> internet aur SaaS ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trust aur untrust zones">
<rect x="20" y="30" width="190" height="110" rx="10" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">Sources</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">mobile users, branches</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="11">mapped zone: default untrust</text>
<rect x="250" y="30" width="140" height="110" rx="10" fill="#ddd6fe"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">Security rules</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">zones ke beech</text>
<rect x="430" y="20" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Trust</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="11">HQ, data center</text>
<rect x="430" y="95" width="190" height="55" rx="10" fill="#fed7aa"/><text x="525" y="119" text-anchor="middle" class="svg-ink" font-size="13">Untrust</text><text x="525" y="137" text-anchor="middle" class="svg-muted" font-size="11">internet aur SaaS</text>
<line x1="210" y1="85" x2="250" y2="85" stroke="#64748b"/><line x1="390" y1="60" x2="430" y2="47" stroke="#64748b"/><line x1="390" y1="110" x2="430" y2="122" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Policy trust aur untrust ke beech enforce hoti hai</text>
</svg><p class="cap">Destination zone decide karta hai ki flow private application access hai ya internet access.</p></div>

<h3>Prisma Access kya banata hai</h3>
<p>Prisma Access teen zones banata hai: <b>Trust</b>, <b>Untrust</b> aur <b>Clientless VPN</b>. Clientless VPN trust se map hota hai aur yeh badla nahi ja sakta. Trust, untrust, inter-fw aur aapke remote networks ke naam reserved hain.</p>

<h3>Mapping: jo sab bhool jaate hain</h3>
<p>Har connection type ka ek <b>mapped zone</b> hota hai. Default mein mapped zone <b>untrust</b> hota hai. Agar koi zone internal ya data center resources tak pahunchta hai, to use <b>Trusted Zones</b> mein move karna padta hai. Panorama par yeh Zone Mapping settings mein hai; remote networks ke liye <code>Templates &gt; Network &gt; Zones</code> mein. Rules trust aur untrust zones ke beech enforce hote hain.</p>
<table class="cmp"><tr><th>Traffic</th><th>Destination zone</th><th>Matlab</th></tr>
<tr><td>User se website ya SaaS</td><td>untrust</td><td>Internet access</td></tr>
<tr><td>User se HQ ka 10.10.0.50</td><td>trust (mapping ke baad)</td><td>Private application access</td></tr>
<tr><td>Branch se HQ</td><td>trust</td><td>Private application access</td></tr>
</table>

<h3>Rules aur best practice</h3>
<p>Rules mein zones, App-ID aur security profiles use karo. Documentation kehti hai <b>any-to-any rules mat likho</b>. SCM default mobile user rules deta hai jo URL blocking, malware aur threat prevention enforce karte hain; documentation lagbhag 15 minute baad verify karne ki salah deti hai. Jab Cloud Identity Engine ya User-ID master device se IP-to-user aur user-to-group mapping available ho, rules users aur groups use kar sakte hain.</p>
<pre class="out">Zone Mapping (lab console view)
Zone name        Mapped as
data-center      <span class="hl">Trust</span>
branch-delhi     Untrust
Internet         Untrust
</pre>
<p>Yahan data-center zone sahi tarah Trust se map hai. Agar yahan Untrust hota, to trust zone mein 10.10.0.50 allow karne wala rule kabhi match nahi hota.</p>

<div class="eg"><p><b>Worked example.</b> Administrator rule likhta hai: source mobile users, destination zone trust, application web-browsing aur ssl, action allow. User connect hota hai, 10.10.0.50 kholta hai aur block ho jaata hai. Traffic log destination zone untrust dikhata hai, kyunki data-center zone kabhi Trusted Zones mein move nahi hua. Remap aur push ke baad wahi flow intended rule hit karta hai. Rule sahi tha; map galat tha.</p></div>

<h3>Chhoti zone planning checklist</h3>
<ul>
<li>Har us network ko list karo jisme internal resources hain: HQ 10.10.0.0/24 aur branch LAN 10.20.0.0/24.</li>
<li>Decide karo inme se kaun Trust hone chahiye, aur rules banane se pehle likh lo.</li>
<li>Push ke baad ek flow internal address par aur ek internet par bhejo, aur har log line mein destination zone padho.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> (1) Data center zones ko untrust chhod dena. (2) "Chalane ke liye" any-to-any rules likhna. (3) Bhool jaana ki mapping change bhi configuration change hai jise push karna padta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Internet versus private application access <i>destination zone mapping</i> follow karta hai: internet aur SaaS ke liye untrust, corporate aur data center resources ke liye trust. Aur: Clientless VPN trust se fixed hai.</p></div>

<div class="scn"><h4>Rule mein allowed, log mein denied</h4><p>Staff ne bataya ki HQ ka HR portal nahi khul raha jabki rule allow karta tha. Engineer ne failed session ka traffic log khola. Matching rule neeche wala default deny tha, aur destination zone untrust tha. HQ zone mapping default par chhodi gayi thi. Zone ko Trusted Zones mein move karke push karne se bina rule badle fix ho gaya.</p><p><b>Seekh:</b> rule match na ho to rule edit karne se pehle log mein zones padho.</p></div>

<div class="iv"><p class="q">"Prisma Access kaun se zones banata hai aur unhe kaise control karte ho?"</p><p>Strong answer: Trust, Untrust aur Clientless VPN. Mapped zones default untrust hote hain; jo bhi internal ya data center resources tak pahunchta hai use Trusted Zones mein move karna padta hai. Policy trust aur untrust ke beech enforce hoti hai, isliye destination zone internet access ko private application access se alag karta hai. Any-to-any rules avoid karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zones: Trust, Untrust aur Clientless VPN (trust se fixed).</li>
<li>Mapped zones default untrust hote hain; internal zones ko Trusted Zones mein move karo.</li>
<li>Policy trust aur untrust zones ke beech enforce hoti hai.</li>
<li>Destination zone internet ko private application access se alag karta hai.</li>
<li>Any-to-any rules nahi; default rules lagbhag 15 minute baad verify karo.</li>
</ul></div>
`}};export{e as default};