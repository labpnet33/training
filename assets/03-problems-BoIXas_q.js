var e={id:`problems`,h:{en:`Why the classic WAN hurts: cost, cloud, visibility and effort`,hi:`Classic WAN kyun takleef deta hai: cost, cloud, visibility aur mehnat`},body:{en:`
<p>The classic WAN worked well when almost every application lived in the company's own data centre. Three things changed over the last fifteen years: applications moved to the cloud, branches multiplied, and cheap fast internet became available almost everywhere. The old design strained under all three. This chapter lists the pain points, one by one, because each of them is a feature that SD-WAN was built to fix.</p>

<h3>Pain 1: cost per megabit</h3>
<p>MPLS is priced for guaranteed quality, not for volume. A commodity broadband line often gives ten times the bandwidth for a fraction of the price. A branch that needs more bandwidth has two choices: pay a lot more for MPLS, or add a second, cheaper line. In the classic design the second choice was hard, because routers could not safely and automatically use two very different lines together.</p>

<h3>Pain 2: lead time and agility</h3>
<p>Ordering an MPLS circuit means a survey, a contract, carrier build work and a cut-over date. Four to twelve weeks is common. A company that opens a pop-up store for a festival season cannot wait that long. Broadband or 4G/5G can be live in days, but the classic router had no easy way to join the corporate network over such a link.</p>

<h3>Pain 3: cloud and SaaS backhaul</h3>
<p>When email, office tools, video meetings and CRM live in the cloud, sending branch traffic to the DC first adds distance and delay and loads the expensive MPLS link with traffic that does not need it. The fix, <b>local internet breakout</b> at each branch, was hard to do safely in the old model because security (firewalls, filtering) lived centrally.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Backhaul versus direct internet access">
<rect x="20" y="90" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="75" y="117" text-anchor="middle" class="svg-ink" font-size="13">Branch user</text>
<rect x="260" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Data centre</text>
<rect x="500" y="90" width="120" height="44" rx="8" fill="#fde68a"/><text x="560" y="117" text-anchor="middle" class="svg-ink" font-size="13">SaaS in cloud</text>
<path d="M130 100 L260 50" stroke="#ef4444" stroke-width="3" fill="none"/><path d="M380 50 L500 100" stroke="#ef4444" stroke-width="3" fill="none"/>
<text x="190" y="64" text-anchor="middle" class="svg-muted" font-size="11">via MPLS</text><text x="450" y="64" text-anchor="middle" class="svg-muted" font-size="11">out to internet</text>
<line x1="130" y1="120" x2="500" y2="120" stroke="#16a34a" stroke-width="3"/>
<text x="315" y="142" text-anchor="middle" class="svg-muted" font-size="11">direct internet breakout (shorter, faster)</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Red path = backhaul (long). Green path = local breakout (short).</text>
</svg><p class="cap">With backhaul the packet travels to the DC and back out. Local breakout reaches the cloud application directly.</p></div>

<h3>Pain 4: path selection is blind to quality</h3>
<p>A routing protocol such as OSPF or BGP chooses the next hop using a metric: hop count, bandwidth, an administrative preference. It does not know that this particular path today has 4% packet loss or 300 ms delay. If both lines are up, it keeps using the preferred one, even when a video call over it is unusable. Routers detect <i>failure</i> (link down) well but not <i>degradation</i> (brownout). Brownouts are the kind of fault users notice first and tools notice last.</p>

<h3>Pain 5: operations are box-by-box</h3>
<p>Every change is a series of commands typed into many devices. Small differences accumulate (<b>configuration drift</b>), a typo in one router becomes a ticket, and there is no single place to see the state of the whole network. New branches need an engineer to pre-stage the router, or ship it to a site with someone who knows the CLI.</p>

<h3>Pain 6: weak, uneven security and visibility</h3>
<p>Traffic across a carrier's MPLS cloud is usually not encrypted (it is private, not secret). Segmentation between departments, guests and payment systems is done with VRFs and access lists that differ from site to site. And the NOC sees only interface counters, not what applications experience.</p>

<table class="cmp"><tr><th>Pain point</th><th>What the business feels</th><th>What SD-WAN will change (next chapters)</th></tr>
<tr><td>High cost per megabit</td><td>Cannot afford bandwidth at every site</td><td>Use cheap broadband beside or instead of MPLS</td></tr>
<tr><td>Long lead time</td><td>New sites wait weeks</td><td>Zero-touch provisioning over any link</td></tr>
<tr><td>Cloud backhaul</td><td>Slow SaaS, wasted WAN capacity</td><td>Direct internet access with central policy and security</td></tr>
<tr><td>Blind path choice</td><td>Poor video and voice quality</td><td>Application-aware routing based on measured loss, delay and jitter</td></tr>
<tr><td>Box-by-box operations</td><td>Slow, error-prone changes</td><td>Central templates and policies</td></tr>
<tr><td>Unencrypted, uneven security</td><td>Audit findings, risk</td><td>IPsec everywhere and consistent segmentation</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch has a 10 Mbps MPLS line (price 100 units) and a 100 Mbps broadband line (price 15 units). Cost per Mbps: MPLS 10 units, broadband 0.15 units, about 66 times cheaper per megabit. If the company can safely carry business traffic over broadband and keep MPLS for the most critical flows, the WAN bill drops sharply and capacity grows tenfold. The word "safely" is the whole story: encryption, monitoring and automatic failover are what SD-WAN adds.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Saying "SD-WAN is just cheaper internet VPN". A plain site-to-site VPN has a tunnel but not the central policy, automation, path measurement or zero-touch onboarding. Those are the parts that fix pain points 4 and 5.</p></div>

<div class="scn"><h4>Brownout at the video desk</h4><p>A bank's treasury branch used MPLS as primary and a broadband line as backup. One afternoon the MPLS carrier had a congested segment: pings worked, but video calls with traders broke up. The router saw no failure, so it never switched to broadband. The NOC found out only from angry users. In the new SD-WAN design the edge measured loss and latency on both paths every second and would have moved the voice and video traffic to the healthy line within moments.</p><p><b>Lesson:</b> "link up" is not the same as "application usable". SD-WAN measures the path itself, not just whether it exists.</p></div>

<div class="iv"><p class="q">"Why are companies moving away from hub-and-spoke MPLS WANs?"</p><p>Mention four points: cloud-first applications make backhauling wasteful; broadband gives far cheaper bandwidth and short lead times; routing protocols cannot react to brownouts; and per-device configuration does not scale. Then say what replaces it: an overlay with central policy and per-application path selection. Avoid saying "MPLS is dead"; many companies keep it for critical traffic as one transport among several.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud applications, many branches and cheap broadband exposed the limits of the classic WAN.</li>
<li>MPLS costs more per megabit and takes weeks to order; broadband and 4G/5G are fast and cheap.</li>
<li>Backhauling cloud traffic to the DC adds delay and wastes WAN capacity.</li>
<li>Routing protocols detect failure but not brownouts such as high loss or jitter.</li>
<li>Box-by-box operations cause drift, errors and slow changes; SD-WAN centralises them.</li>
</ul></div>
`,hi:`
<p>Classic WAN tab achha chalta tha jab lagbhag har application company ke apne data centre mein hoti thi. Pichhle pandrah saalon mein teen cheezein badli: applications cloud mein chali gayi, branches badhi, aur sasta tez internet lagbhag har jagah milne laga. Purana design in teeno ke neeche dab gaya. Yeh chapter pain points ek ek karke ginta hai, kyunki har ek ek aisa feature hai jise fix karne ke liye SD-WAN banaya gaya.</p>

<h3>Pain 1: per megabit cost</h3>
<p>MPLS ki keemat guaranteed quality ke liye hai, volume ke liye nahi. Ek commodity broadband line aksar kuch hi keemat mein das guna bandwidth deti hai. Jis branch ko zyada bandwidth chahiye uske paas do raaste hain: MPLS ke liye bahut zyada paise do, ya ek doosri, sasti line jodo. Classic design mein doosra raasta mushkil tha, kyunki routers do bilkul alag lines ko safely aur automatically saath mein use nahi kar paate the.</p>

<h3>Pain 2: lead time aur agility</h3>
<p>MPLS circuit order karne ka matlab hai survey, contract, carrier ka build work aur cut-over date. Chaar se barah hafte aam hain. Festival season ke liye pop-up store kholne wali company itna wait nahi kar sakti. Broadband ya 4G/5G din mein live ho sakta hai, lekin classic router ke paas aise link par corporate network join karne ka aasan tareeka nahi tha.</p>

<h3>Pain 3: cloud aur SaaS backhaul</h3>
<p>Jab email, office tools, video meetings aur CRM cloud mein hain, to branch traffic ko pehle DC bhejne se doori aur delay badhta hai aur mehenga MPLS link us traffic se bharta hai jise uski zaroorat nahi. Iska fix, har branch par <b>local internet breakout</b>, purane model mein safely karna mushkil tha kyunki security (firewalls, filtering) central jagah par thi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Backhaul aur direct internet access">
<rect x="20" y="90" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="75" y="117" text-anchor="middle" class="svg-ink" font-size="13">Branch user</text>
<rect x="260" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Data centre</text>
<rect x="500" y="90" width="120" height="44" rx="8" fill="#fde68a"/><text x="560" y="117" text-anchor="middle" class="svg-ink" font-size="13">SaaS in cloud</text>
<path d="M130 100 L260 50" stroke="#ef4444" stroke-width="3" fill="none"/><path d="M380 50 L500 100" stroke="#ef4444" stroke-width="3" fill="none"/>
<text x="190" y="64" text-anchor="middle" class="svg-muted" font-size="11">MPLS se</text><text x="450" y="64" text-anchor="middle" class="svg-muted" font-size="11">internet par bahar</text>
<line x1="130" y1="120" x2="500" y2="120" stroke="#16a34a" stroke-width="3"/>
<text x="315" y="142" text-anchor="middle" class="svg-muted" font-size="11">direct internet breakout (chhota, tez)</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Laal path = backhaul (lamba). Hara path = local breakout (chhota).</text>
</svg><p class="cap">Backhaul mein packet DC tak jaata hai aur wapas bahar nikalta hai. Local breakout cloud application tak seedha pahunchta hai.</p></div>

<h3>Pain 4: path selection quality se andha hai</h3>
<p>OSPF ya BGP jaisa routing protocol next hop ek metric se chunta hai: hop count, bandwidth, ek administrative preference. Use nahi pata ki is particular path par aaj 4% packet loss ya 300 ms delay hai. Agar dono lines up hain, woh preferred line use karta rehta hai, chahe us par video call use ke laayak na ho. Routers <i>failure</i> (link down) achhe se pakadte hain, par <i>degradation</i> (brownout) nahi. Brownouts aise faults hain jo users sabse pehle notice karte hain aur tools sabse baad mein.</p>

<h3>Pain 5: operations box-by-box hain</h3>
<p>Har change kai devices mein type ki gayi commands ki series hai. Chhote chhote farak jama hote jaate hain (<b>configuration drift</b>), ek router ka typo ek ticket ban jaata hai, aur poore network ka state dekhne ki koi ek jagah nahi. Naye branches ke liye ek engineer ko router pre-stage karna padta hai, ya use aise insaan ke saath site par bhejna padta hai jo CLI jaanta ho.</p>

<h3>Pain 6: kamzor, uneven security aur visibility</h3>
<p>Carrier ke MPLS cloud ke across traffic aam taur par encrypted nahi hota (woh private hai, secret nahi). Departments, guests aur payment systems ke beech segmentation VRFs aur access lists se hoti hai jo site se site alag hoti hain. Aur NOC sirf interface counters dekhta hai, yeh nahi ki applications ko kya experience ho raha hai.</p>

<table class="cmp"><tr><th>Pain point</th><th>Business ko kya mehsoos hota hai</th><th>SD-WAN kya badlega (agle chapters)</th></tr>
<tr><td>Per megabit high cost</td><td>Har site par bandwidth afford nahi</td><td>MPLS ke saath ya uski jagah sasti broadband</td></tr>
<tr><td>Lamba lead time</td><td>Naye sites hafton wait karti hain</td><td>Kisi bhi link par zero-touch provisioning</td></tr>
<tr><td>Cloud backhaul</td><td>Slow SaaS, WAN capacity ki barbaadi</td><td>Central policy aur security ke saath direct internet access</td></tr>
<tr><td>Andha path choice</td><td>Kharab video aur voice quality</td><td>Naape gaye loss, delay aur jitter par based application-aware routing</td></tr>
<tr><td>Box-by-box operations</td><td>Slow, error-prone changes</td><td>Central templates aur policies</td></tr>
<tr><td>Unencrypted, uneven security</td><td>Audit findings, risk</td><td>Har jagah IPsec aur consistent segmentation</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas 10 Mbps MPLS line (price 100 units) aur 100 Mbps broadband line (price 15 units) hai. Per Mbps cost: MPLS 10 units, broadband 0.15 units, yaani per megabit lagbhag 66 guna sasta. Agar company business traffic broadband par safely chala sake aur sabse critical flows ke liye MPLS rakhe, to WAN bill tezi se girta hai aur capacity das guna badhti hai. "Safely" shabd hi poori kahani hai: encryption, monitoring aur automatic failover wahi hai jo SD-WAN jodta hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> "SD-WAN bas sasta internet VPN hai" kehna. Ek plain site-to-site VPN mein tunnel hota hai, par central policy, automation, path measurement ya zero-touch onboarding nahi hota. Yahi parts pain points 4 aur 5 ko fix karte hain.</p></div>

<div class="scn"><h4>Video desk par brownout</h4><p>Ek bank ki treasury branch MPLS ko primary aur ek broadband line ko backup ki tarah use karti thi. Ek dopahar MPLS carrier ke ek segment mein congestion tha: pings chalte rahe, par traders ke saath video calls toot rahe the. Router ko koi failure dikha hi nahi, isliye woh broadband par kabhi switch nahi hua. NOC ko naraaz users se pata chala. Naye SD-WAN design mein edge har second dono paths par loss aur latency measure karta aur voice aur video traffic ko kuch hi pal mein healthy line par le jaata.</p><p><b>Seekh:</b> "link up" ka matlab "application usable" nahi hai. SD-WAN path ko khud measure karta hai, sirf yeh nahi ki woh hai ya nahi.</p></div>

<div class="iv"><p class="q">"Companies hub-and-spoke MPLS WANs se door kyun ja rahi hain?"</p><p>Chaar points mention karo: cloud-first applications backhaul ko wasteful banati hain; broadband bahut sasta bandwidth aur chhota lead time deta hai; routing protocols brownouts par react nahi kar sakte; aur per-device configuration scale nahi karti. Phir batao ki iski jagah kya aata hai: central policy aur per-application path selection wala overlay. "MPLS khatam ho gaya" kehne se bacho; kai companies critical traffic ke liye use kai transports mein se ek ki tarah rakhti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud applications, bahut saari branches aur sasti broadband ne classic WAN ki limits dikha di.</li>
<li>MPLS per megabit mehenga hai aur order mein hafte lagte hain; broadband aur 4G/5G tez aur sasti hain.</li>
<li>Cloud traffic ko DC backhaul karne se delay badhta hai aur WAN capacity waste hoti hai.</li>
<li>Routing protocols failure pakadte hain, par high loss ya jitter jaise brownouts nahi.</li>
<li>Box-by-box operations drift, errors aur slow changes laate hain; SD-WAN unhe centralise karta hai.</li>
</ul></div>
`}};export{e as default};