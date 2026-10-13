var e={id:`infrastructure-tsg`,h:{en:`Infrastructure subnet, BGP AS, tenant and TSG`,hi:`Infrastructure subnet, BGP AS, tenant aur TSG`},body:{en:`
<p>Before any user or branch can connect, you give Prisma Access a small piece of your own address space and an AS number. This is the <b>service infrastructure</b>. It looks boring but it is the foundation: a wrong choice here can force a rebuild later. This chapter also explains the tenant and the Tenant Service Group (TSG).</p>

<h3>Analogy: the road numbering of a new city</h3>
<p>When a city is built, the planners reserve a block of road numbers for the main highways connecting all districts. Those numbers must never clash with house numbers in any district. The <b>infrastructure subnet</b> is that reserved block, and the <b>infrastructure BGP AS</b> is the highway authority's identity number.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Address blocks that must not overlap">
<rect x="20" y="30" width="140" height="50" rx="6" fill="#bbf7d0"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="12">HQ LAN</text><text x="90" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.0/24</text>
<rect x="175" y="30" width="140" height="50" rx="6" fill="#bae6fd"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="12">Branch LAN</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.20.0.0/24</text>
<rect x="330" y="30" width="140" height="50" rx="6" fill="#fde68a"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="12">Mobile pool</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.200.0.0/23</text>
<rect x="485" y="30" width="140" height="50" rx="6" fill="#ddd6fe"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">Infrastructure</text><text x="555" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.255.0.0/24</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Four blocks, no overlap</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Infrastructure BGP AS 65534 (private AS)</text>
</svg><p class="cap">The lab address plan. Each block belongs to a different purpose and none overlaps.</p></div>

<h3>The infrastructure subnet</h3>
<p>Prisma Access builds its internal backbone using this customer-supplied subnet, and runs dynamic routing inside it. The rules from the documentation:</p>
<ul>
<li>It must <b>not overlap</b> any network you use, including branch LANs, HQ networks and mobile user pools.</li>
<li>Avoid 169.254.0.0/16 and 100.64.0.0/10.</li>
<li>Sizing guidance: a /24 is enough for fewer than 50 sites and 2,500 mobile users; a /23 for fewer than 100 sites and 5,000 users.</li>
</ul>
<p>The lab uses <code>10.255.0.0/24</code>, which is fine for a small tenant.</p>

<h3>The infrastructure BGP AS</h3>
<p>Prisma Access uses BGP internally. The <b>Infrastructure BGP AS</b> must be a private AS number (RFC 6996 range). If you do not set one, it defaults to <b>65534</b>. The same number appears in the Service Setup screen on Panorama and in Infrastructure Settings on SCM. Your own branch and HQ routers must use a different AS: in the lab, HQ-FW uses 65002 and BR-FW uses 65001.</p>
<pre class="out">Infrastructure Settings (lab console view)
Infrastructure Subnet      <span class="hl">10.255.0.0/24</span>
Infrastructure BGP AS      <span class="hl">65534</span>
IPv6 Support               Off
Internal DNS               not set
</pre>

<h3>Tenant and TSG</h3>
<p>A <b>tenant</b> is your own isolated Prisma Access instance. A <b>Tenant Service Group (TSG)</b> is a logical container that holds tenants and can also hold other TSGs. Each tenant gets an automatic <b>TSG ID</b>, which you mostly meet when you create service accounts for automation and APIs. In the lab the placeholder ID is 1234567890. The subscription, the tenant and the identity of the administrators are managed in the common services hub, not inside the firewall-style configuration.</p>
<table class="cmp"><tr><th>Item</th><th>What it is</th><th>Lab value</th></tr>
<tr><td>Tenant</td><td>Your isolated Prisma Access instance</td><td>one tenant</td></tr>
<tr><td>TSG ID</td><td>Container ID, used for service accounts</td><td>1234567890 (placeholder)</td></tr>
<tr><td>Infrastructure subnet</td><td>Backbone address block you supply</td><td>10.255.0.0/24</td></tr>
<tr><td>Infrastructure BGP AS</td><td>Private AS of the backbone</td><td>65534</td></tr>
</table>

<div class="eg"><p><b>Worked example: overlap check.</b> A company plans to use 10.20.0.0/16 for all branches and picks 10.20.255.0/24 as the infrastructure subnet. The /24 sits inside the /16, so it overlaps and can break routing. The fix is to choose a block outside every used range, for example 10.255.0.0/24. Always write down every range in use (HQ, branches, pools, partner networks) before you choose the subnet.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reusing a branch range for the infrastructure subnet. (2) Choosing a block in 100.64.0.0/10 or 169.254.0.0/16. (3) Using the same AS number on your HQ router as the Prisma Access infrastructure AS. (4) Choosing a /24 for a tenant that will grow past the documented user and site limits.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default AS is 65534 and it is a private AS. The infrastructure subnet is supplied by <i>you</i>, not by Prisma Access, and it must not overlap your network.</p></div>

<div class="scn"><h4>A branch that vanished after the merger</h4><p>A company bought another business whose branch LAN used 10.255.0.0/24, exactly the infrastructure subnet. Routes for that branch were dropped or ambiguous inside the backbone, and the branch lost access to HQ. The engineers renumbered the acquired branch rather than the infrastructure subnet, because changing the infrastructure subnet affects the whole tenant.</p><p><b>Lesson:</b> keep a master address register, and check it before every onboarding, not only the first one.</p></div>

<div class="iv"><p class="q">"What is the infrastructure subnet and why does it matter?"</p><p>Strong answer: a customer-supplied block that Prisma Access uses to build its backbone and run dynamic routing. It must not overlap branch, HQ or mobile user ranges, and should avoid 100.64.0.0/10 and 169.254.0.0/16. Mention the sizing guidance (/24 or /23), the private infrastructure AS defaulting to 65534, and that the tenant has a TSG ID.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Infrastructure subnet: yours to supply, no overlaps, avoid 100.64.0.0/10 and 169.254.0.0/16.</li>
<li>Sizing: /24 below 50 sites and 2,500 users; /23 below 100 sites and 5,000 users.</li>
<li>Infrastructure BGP AS is private and defaults to 65534.</li>
<li>A tenant sits in a TSG; the TSG ID is used for service accounts.</li>
<li>Keep an address register for all ranges.</li>
</ul></div>
`,hi:`
<p>Koi bhi user ya branch connect ho, uske pehle aap Prisma Access ko apne address space ka ek chhota hissa aur ek AS number dete ho. Yeh <b>service infrastructure</b> hai. Dikhne mein boring hai lekin yahi foundation hai: yahan galat choice baad mein rebuild force kar sakti hai. Yeh chapter tenant aur Tenant Service Group (TSG) bhi samjhata hai.</p>

<h3>Analogy: naye shehar ke road numbers</h3>
<p>Jab shehar banta hai, planners main highways ke liye road numbers ka ek block reserve karte hain jo saare districts ko jodte hain. Yeh numbers kisi bhi district ke house numbers se clash nahi hone chahiye. <b>Infrastructure subnet</b> woh reserved block hai, aur <b>infrastructure BGP AS</b> highway authority ka identity number hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Address blocks jo overlap nahi hone chahiye">
<rect x="20" y="30" width="140" height="50" rx="6" fill="#bbf7d0"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="12">HQ LAN</text><text x="90" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.0/24</text>
<rect x="175" y="30" width="140" height="50" rx="6" fill="#bae6fd"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="12">Branch LAN</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.20.0.0/24</text>
<rect x="330" y="30" width="140" height="50" rx="6" fill="#fde68a"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="12">Mobile pool</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.200.0.0/23</text>
<rect x="485" y="30" width="140" height="50" rx="6" fill="#ddd6fe"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">Infrastructure</text><text x="555" y="68" text-anchor="middle" class="svg-muted" font-size="11">10.255.0.0/24</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Chaar blocks, koi overlap nahi</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Infrastructure BGP AS 65534 (private AS)</text>
</svg><p class="cap">Lab address plan. Har block ka alag purpose hai aur koi overlap nahi karta.</p></div>

<h3>Infrastructure subnet</h3>
<p>Prisma Access is customer-supplied subnet se apna internal backbone banata hai, aur iske andar dynamic routing chalata hai. Documentation ke rules:</p>
<ul>
<li>Yeh aapke kisi bhi network se <b>overlap nahi</b> karna chahiye, branch LANs, HQ networks aur mobile user pools bhi.</li>
<li>169.254.0.0/16 aur 100.64.0.0/10 avoid karo.</li>
<li>Sizing guidance: 50 se kam sites aur 2,500 mobile users ke liye /24 kaafi hai; 100 se kam sites aur 5,000 users ke liye /23.</li>
</ul>
<p>Lab <code>10.255.0.0/24</code> use karta hai, jo chhote tenant ke liye theek hai.</p>

<h3>Infrastructure BGP AS</h3>
<p>Prisma Access andar BGP use karta hai. <b>Infrastructure BGP AS</b> private AS number (RFC 6996 range) hona chahiye. Agar aap set nahi karte to default <b>65534</b> hota hai. Wahi number Panorama ki Service Setup screen aur SCM ki Infrastructure Settings mein dikhta hai. Aapke apne branch aur HQ routers ko alag AS use karna hai: lab mein HQ-FW 65002 aur BR-FW 65001 use karte hain.</p>
<pre class="out">Infrastructure Settings (lab console view)
Infrastructure Subnet      <span class="hl">10.255.0.0/24</span>
Infrastructure BGP AS      <span class="hl">65534</span>
IPv6 Support               Off
Internal DNS               not set
</pre>

<h3>Tenant aur TSG</h3>
<p><b>Tenant</b> aapka apna isolated Prisma Access instance hai. <b>Tenant Service Group (TSG)</b> ek logical container hai jo tenants ko hold karta hai aur dusre TSGs ko bhi. Har tenant ko automatic <b>TSG ID</b> milta hai, jo aapko mainly automation aur APIs ke liye service accounts banate waqt milta hai. Lab mein placeholder ID 1234567890 hai. Subscription, tenant aur administrators ki identity common services hub mein manage hoti hai, firewall-style configuration ke andar nahi.</p>
<table class="cmp"><tr><th>Item</th><th>Kya hai</th><th>Lab value</th></tr>
<tr><td>Tenant</td><td>Aapka isolated Prisma Access instance</td><td>ek tenant</td></tr>
<tr><td>TSG ID</td><td>Container ID, service accounts mein use hota hai</td><td>1234567890 (placeholder)</td></tr>
<tr><td>Infrastructure subnet</td><td>Aapka diya hua backbone address block</td><td>10.255.0.0/24</td></tr>
<tr><td>Infrastructure BGP AS</td><td>Backbone ka private AS</td><td>65534</td></tr>
</table>

<div class="eg"><p><b>Worked example: overlap check.</b> Ek company saari branches ke liye 10.20.0.0/16 use karne ka plan karti hai aur infrastructure subnet 10.20.255.0/24 chunti hai. Yeh /24 /16 ke andar aata hai, to overlap hai aur routing toot sakti hai. Fix: har used range ke bahar ka block chuno, jaise 10.255.0.0/24. Subnet chunne se pehle har used range (HQ, branches, pools, partner networks) likh lo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Infrastructure subnet ke liye branch range reuse karna. (2) 100.64.0.0/10 ya 169.254.0.0/16 mein block chunna. (3) HQ router par wahi AS number use karna jo Prisma Access infrastructure AS hai. (4) Aisa tenant jo documented user aur site limits se aage badhega, uske liye /24 chunna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default AS 65534 hai aur yeh private AS hai. Infrastructure subnet <i>aap</i> supply karte ho, Prisma Access nahi, aur yeh aapke network se overlap nahi karna chahiye.</p></div>

<div class="scn"><h4>Merger ke baad gayab hui branch</h4><p>Ek company ne doosra business kharida jiski branch LAN 10.255.0.0/24 thi, bilkul infrastructure subnet jaisi. Us branch ke routes backbone ke andar drop ya ambiguous ho gaye, aur branch HQ tak nahi pahunch paayi. Engineers ne infrastructure subnet nahi balki acquired branch ko renumber kiya, kyunki infrastructure subnet badalna poore tenant ko affect karta hai.</p><p><b>Seekh:</b> master address register rakho, aur har onboarding se pehle check karo, sirf pehle se nahi.</p></div>

<div class="iv"><p class="q">"Infrastructure subnet kya hai aur kyun matter karta hai?"</p><p>Strong answer: customer-supplied block jise Prisma Access backbone banane aur dynamic routing chalane ke liye use karta hai. Yeh branch, HQ ya mobile user ranges se overlap nahi karna chahiye, aur 100.64.0.0/10 aur 169.254.0.0/16 avoid karne chahiye. Sizing guidance (/24 ya /23), private infrastructure AS jo default 65534 hai, aur tenant ka TSG ID hona mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Infrastructure subnet: aap supply karte ho, overlap nahi, 100.64.0.0/10 aur 169.254.0.0/16 avoid.</li>
<li>Sizing: 50 sites aur 2,500 users se kam par /24; 100 sites aur 5,000 users se kam par /23.</li>
<li>Infrastructure BGP AS private hota hai aur default 65534 hai.</li>
<li>Tenant TSG mein hota hai; TSG ID service accounts mein use hota hai.</li>
<li>Saari ranges ka address register rakho.</li>
</ul></div>
`}};export{e as default};