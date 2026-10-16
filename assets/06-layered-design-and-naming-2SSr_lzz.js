var e={id:`layered-design-and-naming`,h:{en:`Designing layered templates and consistent names`,hi:`Layered templates aur consistent naming ka design`},body:{en:`
<p>A company dress code works in layers. The whole company wears an ID badge. A region may add a rule about formal wear. A single office may add a rule about its own security door. Nobody writes a separate dress code for every employee; each layer adds only what is true at that level. Template design for a growing network works the same way: <b>global, region, site, role</b>.</p>

<h3>The four layers</h3>
<table class="tbl"><thead><tr><th>Layer</th><th>Contains</th><th>Example in MyPnetLab</th></tr></thead><tbody>
<tr><td>Global</td><td>Settings true everywhere</td><td>NK-GLOBAL: NTP, DNS, management profiles</td></tr>
<tr><td>Region</td><td>Settings true for one area</td><td>NK-REGION: MTU for a tunnelled ISP, regional syslog</td></tr>
<tr><td>Site or branch design</td><td>The shape of a branch</td><td>NK-BRANCH-NET: interfaces, zones, default route with variables</td></tr>
<tr><td>Role</td><td>What a box does</td><td>Internet edge, data centre edge</td></tr>
</tbody></table>
<p>In the stack, put the most specific first. For example a stack might list the role or site template, then the region, then the global one, and the lab's priority rule means the specific value wins when two layers disagree. Whether you need all four layers depends on the size of the company. A company with three branches may need only two. Start simple and add a layer only when a real exception appears twice.</p>

<h3>Do not hide differences in templates</h3>
<p>If two sites differ only by an address, that is a variable, not a new template. If two sites differ by a whole behaviour (for example one has a tunnelled ISP), that is a template layer. If you notice you are copying a template and changing one line, stop and ask which of those two it is.</p>

<h3>Consistent interface and zone names</h3>
<p>Policy references zones, and templates create zones. If Pune calls its outside zone <code>untrust</code> and Delhi calls it <code>outside</code>, one shared rule from a device group cannot work on both. The lab design is deliberately consistent: ethernet1/1 is WAN in zone untrust, ethernet1/2 is LAN in zone trust, in every branch.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator): naming standard as a comment block</span>
ethernet1/1  = WAN   zone untrust
ethernet1/2  = LAN   zone trust
ethernet1/3  = DMZ   zone dmz   (future)
variable names: $wan-ip  $wan-gw  $lan-ip  (lowercase, hyphen, role first)</pre>
<p>Different hardware models can have different port counts and speeds. Check the documentation for your PAN-OS version and your hardware models before assuming that an interface name exists everywhere. A standard that says "ethernet1/1 is always WAN" is valuable precisely because the template can then refer to it by name; a box that cannot honour it needs a separate template layer, not a hand edit.</p>

<h3>Why naming is part of the design</h3>
<p>Good names are documentation. A name like <code>NK-BRANCH-NET</code> says who owns it and what it does; <code>template2-final-new</code> says nothing. Use a prefix for the company, a word for the layer or purpose, and a clear suffix. Variable names follow the same idea: <code>$wan-gw</code> is clear, <code>$x1</code> is a future outage.</p>

<div class="scn"><h4>The zone that was called outside</h4><p>One engineer built a lab firewall by hand with a zone named outside. When the shared policy referenced untrust, the device-group push for that firewall failed with an invalid zone reference. Fixing it meant rebuilding the interface assignment. After that the team added a naming standard page and a check: every new firewall joins the branch stack before anyone types a zone name.</p></div>

<div class="iv"><p class="q">"How would you structure templates for fifty branches in three regions?"</p><p>A global template for company-wide settings, one regional template per region, and a branch-design template that uses variables for site facts, combined in a stack with the most specific first. Names for interfaces and zones are standardised so shared policy works everywhere. I would add roles only when a real exception appears.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer templates: global, region, site design, role. Each adds only what is true at its level.</li>
<li>One-line differences are variables; behaviour differences are template layers.</li>
<li>Standard interface and zone names make shared policy portable.</li>
<li>Check hardware and PAN-OS documentation before assuming interface names exist everywhere.</li>
</ul></div>
`,hi:`
<p>Company ka dress code layers mein chalta hai. Poori company ID badge pehenti hai. Ek region formal wear ka rule jod sakta hai. Ek office apne security door ka rule jod sakta hai. Har employee ke liye alag dress code nahi likha jaata; har layer sirf wahi jodti hai jo us level par sach hai. Badhte network ka template design bhi aise hi chalta hai: <b>global, region, site, role</b>.</p>

<h3>Chaar layers</h3>
<table class="tbl"><thead><tr><th>Layer</th><th>Kya rehta hai</th><th>MyPnetLab mein example</th></tr></thead><tbody>
<tr><td>Global</td><td>Jo settings har jagah sach hain</td><td>NK-GLOBAL: NTP, DNS, management profiles</td></tr>
<tr><td>Region</td><td>Ek area ki settings</td><td>NK-REGION: tunnelled ISP ka MTU, regional syslog</td></tr>
<tr><td>Site ya branch design</td><td>Branch ki shape</td><td>NK-BRANCH-NET: interfaces, zones, variables wala default route</td></tr>
<tr><td>Role</td><td>Box kya karta hai</td><td>Internet edge, data centre edge</td></tr>
</tbody></table>
<p>Stack mein sabse specific pehle rakho. Jaise stack mein role ya site template, phir region, phir global ho sakta hai, aur lab ka priority rule matlab jab do layers disagree karein to specific value jeetti hai. Chaaron layers chahiye ya nahi ye company ke size par depend karta hai. Teen branches ki company ko sirf do chahiye ho sakti hain. Simple se shuru karo aur layer tab jodo jab asli exception do baar dikhe.</p>

<h3>Farq ko templates mein chhupao mat</h3>
<p>Do sites sirf address se alag hain to wo variable hai, naya template nahi. Do sites poore behaviour mein alag hain (jaise ek ka ISP tunnelled hai) to wo template layer hai. Agar tum template copy karke ek line badal rahe ho to ruko aur socho ye dono mein se kaunsa hai.</p>

<h3>Consistent interface aur zone names</h3>
<p>Policy zones ko reference karti hai, aur templates zones banate hain. Agar Pune apne outside zone ko <code>untrust</code> kahe aur Delhi <code>outside</code>, to device group ka ek shared rule dono par kaam nahi kar sakta. Lab design jaan-boojh kar consistent hai: har branch mein ethernet1/1 WAN hai zone untrust mein, ethernet1/2 LAN hai zone trust mein.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator): naming standard comment block ki tarah</span>
ethernet1/1  = WAN   zone untrust
ethernet1/2  = LAN   zone trust
ethernet1/3  = DMZ   zone dmz   (future)
variable names: $wan-ip  $wan-gw  $lan-ip  (lowercase, hyphen, role pehle)</pre>
<p>Alag hardware models ke port counts aur speeds alag ho sakte hain. Ye maanne se pehle ki interface name har jagah hai, apne PAN-OS version aur hardware models ki documentation check karo. "ethernet1/1 hamesha WAN hai" jaisa standard isiliye keemti hai ki template use naam se refer kar sakta hai; jo box ise nibha nahi sakta use alag template layer chahiye, hand edit nahi.</p>

<h3>Naming design ka hissa kyun hai</h3>
<p>Achhe naam documentation hain. <code>NK-BRANCH-NET</code> jaisa naam batata hai ki kiska hai aur kya karta hai; <code>template2-final-new</code> kuch nahi batata. Company ke liye prefix, layer ya purpose ke liye ek shabd, aur clear suffix use karo. Variable names bhi yahi idea follow karte hain: <code>$wan-gw</code> clear hai, <code>$x1</code> future outage hai.</p>

<div class="scn"><h4>Jis zone ka naam outside tha</h4><p>Ek engineer ne lab firewall haath se banaya aur zone ka naam outside rakha. Jab shared policy ne untrust reference kiya to us firewall ka device-group push invalid zone reference ke saath fail hua. Fix ka matlab interface assignment dobara banana tha. Uske baad team ne naming standard page aur ek check joda: har naya firewall pehle branch stack join karta hai, phir koi zone ka naam type karta hai.</p></div>

<div class="iv"><p class="q">"Teen regions ke pachas branches ke liye templates ka structure kaisa rakhoge?"</p><p>Company-wide settings ke liye global template, har region ke liye ek regional template, aur site facts ke liye variables wala branch-design template, stack mein sabse specific pehle. Interfaces aur zones ke naam standardise taaki shared policy har jagah chale. Role tab jodunga jab asli exception aaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates layer karo: global, region, site design, role. Har layer sirf apne level ka sach jodti hai.</li>
<li>Ek-line farq variables hain; behaviour farq template layers hain.</li>
<li>Standard interface aur zone names se shared policy portable banti hai.</li>
<li>Interface names har jagah maanne se pehle hardware aur PAN-OS documentation check karo.</li>
</ul></div>
`}};export{e as default};