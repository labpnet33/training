var e={id:`params-args`,h:{en:`Parameters and arguments: the blanks in your template`,hi:`Parameters aur arguments: template ke blanks`},body:{en:`
<p>A function that always does exactly the same thing is not very useful. The real power comes when the function can be given <b>different values each time</b>. This chapter explains how values go in.</p>
<h3>The blank in the recipe</h3>
<p>Think of a printed config template: <code>interface ______ / ip address ______</code>. The blanks are empty on the printed form, and an engineer fills them in. In Python the blanks have names and live in the brackets after the function name. They are called <b>parameters</b>. The actual values you fill in when you call the function are called <b>arguments</b>.</p>
<pre class="code">def show_interface(name):
    print("interface " + name)
    print(" no shutdown")

show_interface("GigabitEthernet0/1")
show_interface("Loopback0")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/1
 no shutdown
interface Loopback0
 no shutdown</pre>
<p>Here <code>name</code> is the parameter. In the first call the argument is <code>"GigabitEthernet0/1"</code>, so inside the function <code>name</code> holds that text. In the second call it holds <code>"Loopback0"</code>. The parameter exists only while the function runs.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parameter versus argument"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Call</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">show_interface("Gi0/1")</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Argument</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">"Gi0/1" is the real value</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parameter</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">name receives it</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Body</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">uses name</text></svg><p class="cap">Parameter versus argument</p></div>
<h3>Several parameters, and their order</h3>
<p>Separate parameters with commas. When you call the function with plain values, they are matched <b>by position</b>: the first argument goes to the first parameter, the second to the second, and so on.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")

show_interface("GigabitEthernet0/1", "10.10.1.1", "LAN-USERS")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0</pre>
<p>Now see what happens when the order is wrong. Python does not know that <code>"LAN-USERS"</code> is a description; it only counts positions.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")

show_interface("LAN-USERS", "GigabitEthernet0/1", "10.10.1.1")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface LAN-USERS
 description 10.10.1.1
 ip address GigabitEthernet0/1 255.255.255.0</pre>
<p>No error appears, yet the config is nonsense. This kind of silent mistake is the dangerous one. The cure is the next idea.</p>
<h3>Keyword arguments: say the name</h3>
<p>You can write <code>parameter=value</code> in the call. Then the order no longer matters and the line explains itself.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")

show_interface(desc="LAN-CCTV", name="GigabitEthernet0/2", ip="10.10.2.1")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0</pre>
<p>A good habit for functions with three or more parameters is to use keyword arguments in the call. Anyone reading the line knows what each value means.</p>
<h3>Default values: optional parameters</h3>
<p>Most LAN interfaces use <code>255.255.255.0</code>. You can give a parameter a <b>default</b> with <code>=</code> in the <code>def</code> line. If the caller does not supply that argument, the default is used.</p>
<pre class="code">def show_interface(name, ip, mask="255.255.255.0"):
    print("interface " + name)
    print(" ip address " + ip + " " + mask)

show_interface("GigabitEthernet0/1", "10.10.1.1")
show_interface("GigabitEthernet0/2", "10.10.2.1", "255.255.255.252")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/1
 ip address 10.10.1.1 255.255.255.0
interface GigabitEthernet0/2
 ip address 10.10.2.1 255.255.255.252</pre>
<p>The first call uses the default mask. The second overrides it. Parameters with defaults must come <b>after</b> the ones without defaults.</p>
<h3>Wrong number of arguments</h3>
<p>If you give too few or too many arguments, Python stops and tells you exactly what is missing.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)

show_interface("GigabitEthernet0/1", "10.10.1.1")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "missing.py", line 4, in &lt;module&gt;
    show_interface("GigabitEthernet0/1", "10.10.1.1")
TypeError: show_interface() missing 1 required positional argument: 'desc'</pre>
<p>The last line names the function and the missing parameter. In the lab this exact error appears whenever a call and a <code>def</code> disagree, so read the last line before anything else.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Mixing up parameter and argument: parameter is the name in <code>def</code>, argument is the value in the call. (2) Giving arguments in the wrong order and getting silent nonsense. (3) Putting a default parameter before a non-default one, which is a SyntaxError. (4) Using a number where text is needed: <code>"vlan " + 10</code> fails; write <code>"vlan " + str(10)</code> or an f-string.</p></div>
<div class="exam"><p><b>Exam trap.</b> The words are tested directly: "name, ip in the def line are <i>_</i>; the values in the call are <i>_</i>". Parameters, then arguments. Also remember that keyword arguments may be given in any order.</p></div>
<div class="scn"><h4>The VLAN that went to the wrong switch</h4><p>A script called <code>add_vlan(switch, vlan_id, name)</code> was used by two teammates. One wrote <code>add_vlan("SW1", 20, "SCANNERS")</code>; the other wrote <code>add_vlan("SCANNERS", "SW1", 20)</code> from memory. The second call produced a config for a switch named SCANNERS. Nothing crashed, because every value was text. The team changed all calls to keyword form, <code>add_vlan(switch="SW1", vlan_id=20, name="SCANNERS")</code>, and the mistake never came back.</p>
<p><b>Lesson:</b> keyword arguments make calls self-documenting and safe against order mistakes.</p></div>
<div class="iv"><p class="q">"What is the difference between a parameter and an argument?"</p><p>A parameter is the variable name in the function definition. An argument is the actual value passed in when the function is called. Mention positional versus keyword arguments, and that default values make a parameter optional.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parameters are the named blanks in the <code>def</code> line; arguments are the values in the call.</li>
<li>Positional arguments are matched by order; keyword arguments by name.</li>
<li><code>mask="255.255.255.0"</code> gives a parameter a default, so it becomes optional.</li>
<li>A wrong number of arguments gives a TypeError that names what is missing.</li>
<li>Use keyword arguments when a function has three or more parameters.</li>
</ul></div>
`,hi:`
<p>Jo function hamesha ek hi kaam karta hai woh bahut kaam ka nahi. Asli taakat tab aati hai jab function ko <b>har baar alag values</b> di ja sakein. Yeh chapter samjhata hai ki values andar kaise jaati hain.</p>
<h3>Recipe ka blank</h3>
<p>Socho ek printed config template: <code>interface ______ / ip address ______</code>. Printed form par blanks khaali hain aur engineer unhe bharta hai. Python mein blanks ke naam hote hain aur woh function ke naam ke baad brackets mein rehte hain. Unhe <b>parameters</b> kehte hain. Function call karte waqt jo asli values bharte ho unhe <b>arguments</b> kehte hain.</p>
<pre class="code">def show_interface(name):
    print("interface " + name)
    print(" no shutdown")

show_interface("GigabitEthernet0/1")
show_interface("Loopback0")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/1
 no shutdown
interface Loopback0
 no shutdown</pre>
<p>Yahan <code>name</code> parameter hai. Pehli call mein argument <code>"GigabitEthernet0/1"</code> hai, isliye function ke andar <code>name</code> mein wahi text hai. Doosri call mein usme <code>"Loopback0"</code> hai. Parameter sirf tab tak rehta hai jab tak function chal raha hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parameter vs argument"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Call</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">show_interface("Gi0/1")</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Argument</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">"Gi0/1" asli value hai</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parameter</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">name use leta hai</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Body</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">name use karti hai</text></svg><p class="cap">Parameter vs argument</p></div>
<h3>Kai parameters aur unka order</h3>
<p>Parameters ko commas se alag karo. Jab aap seedhi values ke saath call karte ho, woh <b>position ke hisaab se</b> match hoti hain: pehla argument pehle parameter ko, doosra doosre ko, aur aise hi.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")

show_interface("GigabitEthernet0/1", "10.10.1.1", "LAN-USERS")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0</pre>
<p>Ab dekho jab order galat ho. Python nahi jaanta ki <code>"LAN-USERS"</code> description hai; woh sirf positions ginta hai.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")

show_interface("LAN-USERS", "GigabitEthernet0/1", "10.10.1.1")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface LAN-USERS
 description 10.10.1.1
 ip address GigabitEthernet0/1 255.255.255.0</pre>
<p>Koi error nahi aaya, phir bhi config bekaar hai. Aisi silent galti sabse khatarnak hoti hai. Ilaaj agla idea hai.</p>
<h3>Keyword arguments: naam bolo</h3>
<p>Call mein <code>parameter=value</code> likh sakte ho. Phir order matter nahi karta aur line khud samjhati hai.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")

show_interface(desc="LAN-CCTV", name="GigabitEthernet0/2", ip="10.10.2.1")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0</pre>
<p>Teen ya zyada parameters wale functions ke liye call mein keyword arguments use karna achhi aadat hai. Line padhne wala har value ka matlab jaan jaata hai.</p>
<h3>Default values: optional parameters</h3>
<p>Zyadatar LAN interfaces <code>255.255.255.0</code> use karte hain. <code>def</code> line mein <code>=</code> se parameter ko <b>default</b> de sakte ho. Caller woh argument na de to default use hota hai.</p>
<pre class="code">def show_interface(name, ip, mask="255.255.255.0"):
    print("interface " + name)
    print(" ip address " + ip + " " + mask)

show_interface("GigabitEthernet0/1", "10.10.1.1")
show_interface("GigabitEthernet0/2", "10.10.2.1", "255.255.255.252")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/1
 ip address 10.10.1.1 255.255.255.0
interface GigabitEthernet0/2
 ip address 10.10.2.1 255.255.255.252</pre>
<p>Pehli call default mask use karti hai. Doosri use override karti hai. Default wale parameters bina default wale parameters ke <b>baad</b> aane chahiye.</p>
<h3>Arguments ki galat sankhya</h3>
<p>Kam ya zyada arguments doge to Python ruk kar bata deta hai ki kya missing hai.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)

show_interface("GigabitEthernet0/1", "10.10.1.1")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "missing.py", line 4, in &lt;module&gt;
    show_interface("GigabitEthernet0/1", "10.10.1.1")
TypeError: show_interface() missing 1 required positional argument: 'desc'</pre>
<p>Aakhri line function ka naam aur missing parameter batati hai. Lab mein yahi error tab aata hai jab call aur <code>def</code> mein mel nahi hota, isliye sabse pehle aakhri line padho.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Parameter aur argument mix karna: parameter <code>def</code> ka naam hai, argument call ki value. (2) Arguments galat order mein dena aur silent bekaar output paana. (3) Default parameter ko bina-default parameter se pehle rakhna, jo SyntaxError hai. (4) Jahan text chahiye wahan number dena: <code>"vlan " + 10</code> fail hota hai; <code>"vlan " + str(10)</code> ya f-string likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shabd seedhe poochhe jaate hain: "def line ke name, ip <i>_</i> hain; call ki values <i>_</i> hain". Parameters, phir arguments. Yeh bhi yaad rakho ki keyword arguments kisi bhi order mein diye ja sakte hain.</p></div>
<div class="scn"><h4>Jo VLAN galat switch par gaya</h4><p><code>add_vlan(switch, vlan_id, name)</code> script do teammates use karte the. Ek ne <code>add_vlan("SW1", 20, "SCANNERS")</code> likha; doosre ne yaad se <code>add_vlan("SCANNERS", "SW1", 20)</code> likha. Doosri call ne SCANNERS naam ke switch ka config bana diya. Kuch crash nahi hua, kyunki har value text thi. Team ne sab calls keyword form mein badal di, <code>add_vlan(switch="SW1", vlan_id=20, name="SCANNERS")</code>, aur galti kabhi wapas nahi aayi.</p>
<p><b>Lesson:</b> keyword arguments calls ko self-documenting aur order ki galtiyon se surakshit banate hain.</p></div>
<div class="iv"><p class="q">"Parameter aur argument mein kya difference hai?"</p><p>Parameter function definition ka variable naam hai. Argument woh asli value hai jo function call karte waqt di jaati hai. Positional vs keyword arguments ka zikr karo, aur yeh ki default values parameter ko optional bana deti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parameters <code>def</code> line ke named blanks hain; arguments call ki values hain.</li>
<li>Positional arguments order se match hote hain; keyword arguments naam se.</li>
<li><code>mask="255.255.255.0"</code> parameter ko default deta hai, isliye woh optional ho jaata hai.</li>
<li>Galat sankhya mein arguments dene par TypeError aata hai jo missing cheez ka naam batata hai.</li>
<li>Teen ya zyada parameters wale function mein keyword arguments use karo.</li>
</ul></div>
`}};export{e as default};