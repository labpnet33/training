var e={id:`readonly-tools`,h:{en:`Read-only show commands as tools`,hi:`Read-only show commands tools ki tarah`},body:{en:`
<p><b>One idea:</b> the safest network tool is a <b>narrow, read-only question</b> with a fixed answer shape. Instead of giving an assistant a keyboard, you give it a menu of specific questions: "show the version of R1", "show interface Gi1 on SW1". Each menu item is a tool that maps to <b>one fixed command template</b>.</p>
<h3>Bad design and good design</h3>
<table class="cmp"><tr><th></th><th>Bad: one tool "run_command"</th><th>Good: one tool per intent</th></tr><tr><td>What the model sends</td><td>Any text it likes</td><td>A tool name and a few validated arguments</td></tr><tr><td>What can happen</td><td>Anything the account allows, including changes</td><td>Only the listed show commands</td></tr><tr><td>How you review it</td><td>You cannot</td><td>Read the short table of templates</td></tr><tr><td>How you log it</td><td>Raw strings</td><td>Tool name plus arguments</td></tr></table>
<h3>Anatomy of a good tool</h3>
<ul><li><b>A name that says the intent</b>: <code>show_interface</code>, not <code>do_thing</code>.</li><li><b>A description that says it is read-only</b> and what it returns. The model reads this to choose tools, and a human reviewer reads it to trust the tool.</li><li><b>A strict schema</b>: types, an <code>enum</code> for devices (only inventory names), a <code>pattern</code> for interface names, <code>additionalProperties: false</code> so extra fields are rejected.</li><li><b>A fixed command template</b> in your code. The model supplies values, never command words.</li><li><b>A bounded answer</b>: limited length, parsed or trimmed text, and a clear error shape.</li></ul>
<p>Here is the schema for one tool, as the server would publish it (reference format):</p>
<pre class="code"><span class="c">// Reference tool definition (not run in the simulator)</span>
{
  "name": "show_interface",
  "description": "Read-only. Show one interface on one inventory device. Does not change configuration.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "device":    { "type": "string", "enum": ["R1", "R2", "SW1"] },
      "interface": { "type": "string", "pattern": "^(Gi|Te)[0-9]+(/[0-9]+){0,2}$" }
    },
    "required": ["device", "interface"],
    "additionalProperties": false
  }
}</pre>
<p>The <code>pattern</code> is a <b>regular expression</b>, a compact rule for allowed text. Here it says: the name must start with <code>Gi</code> or <code>Te</code>, then digits, then up to two more groups of a slash and digits. <code>Gi0/0/1</code> passes; <code>Gi1; reload</code> does not, because of the space and semicolon.</p>
<h3>The same rules enforced in code</h3>
<p>A schema is documentation for the model, but the model may still send something outside it. So the server must <b>check again</b> in its own code, every time. The program below does that and runs for real. It never connects to a device; it only builds the command that <i>would</i> be sent, using documentation addresses.</p>
<pre class="code">import re

INVENTORY = {"R1": "192.0.2.11", "R2": "192.0.2.12", "SW1": "192.0.2.21"}   # documentation addresses
INTERFACE = re.compile(r"^(Gi|Te)[0-9]+(/[0-9]+){0,2}$")                   # e.g. Gi1 or Gi0/0/1

<span class="c"># One tool per intent. Each maps to ONE fixed command template. No free text from the model.</span>
TOOLS = {
    "show_version":          {"template": "show version",                  "args": ["device"]},
    "show_interfaces_brief": {"template": "show ip interface brief",       "args": ["device"]},
    "show_interface":        {"template": "show interfaces {interface}",   "args": ["device", "interface"]},
}

def build_command(tool, arguments):
    """Return (device_address, command) or raise ValueError with a clear reason."""
    if tool not in TOOLS:
        raise ValueError("unknown tool")
    spec = TOOLS[tool]
    extra = set(arguments) - set(spec["args"])
    if extra:
        raise ValueError("unexpected argument(s): " + ", ".join(sorted(extra)))
    device = arguments.get("device")
    if device not in INVENTORY:
        raise ValueError("device is not in the inventory")
    values = {}
    if "interface" in spec["args"]:
        interface = arguments.get("interface", "")
        if not INTERFACE.fullmatch(interface):
            raise ValueError("interface name is not valid")
        values["interface"] = interface
    return INVENTORY[device], spec["template"].format(**values)

attempts = [
    ("show_interfaces_brief", {"device": "R1"}),
    ("show_interface", {"device": "SW1", "interface": "Gi0/0/1"}),
    ("show_interface", {"device": "R1", "interface": "Gi1; reload"}),
    ("show_version", {"device": "R9"}),
    ("show_version", {"device": "R1", "command": "configure terminal"}),
    ("reload_device", {"device": "R1"}),
]
for tool, args in attempts:
    try:
        address, command = build_command(tool, args)
        print("ALLOW ", tool, "-&gt;", address, ":", command)
    except ValueError as err:
        print("DENY  ", tool, args, "-&gt;", err)</pre>
<pre class="out">ALLOW  show_interfaces_brief -&gt; 192.0.2.11 : show ip interface brief
ALLOW  show_interface -&gt; 192.0.2.21 : show interfaces Gi0/0/1
DENY   show_interface {'device': 'R1', 'interface': 'Gi1; reload'} -&gt; interface name is not valid
DENY   show_version {'device': 'R9'} -&gt; device is not in the inventory
DENY   show_version {'device': 'R1', 'command': 'configure terminal'} -&gt; unexpected argument(s): command
DENY   reload_device {'device': 'R1'} -&gt; unknown tool</pre>
<ul><li><code>re.compile(...)</code> prepares the regular expression once; <code>INTERFACE.fullmatch(name)</code> tests the whole name against it (match would accept a trailing newline).</li><li><code>set(arguments) - set(spec["args"])</code> finds arguments that are not expected, so an extra <code>command</code> field is refused.</li><li><code>spec["template"].format(**values)</code> fills the fixed template. Only validated values go in.</li><li>Each refusal gives a short, clear reason. The model can read it and correct its next call; a human can read it in the log.</li></ul>
<p>Notice the fifth attempt: the model tried to add a <code>command</code> argument. It is denied, not silently ignored. And the sixth, <code>reload_device</code>, is simply not on the menu. Because every tool is a fixed show template, there is no tool that could change a device.</p>
<div class="warn"><p><b>Common mistake.</b> Thinking "show" commands are always harmless. A show command can be slow or heavy (for example a large <code>show tech-support</code>), and some output contains secrets such as hashes or keys. Choose the commands deliberately and cap their output and rate.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the design rules: one tool per intent, fixed templates, strict schemas, validation in server code as well as in the schema, and no generic "run any command" tool.</p></div>
<div class="eg"><p><b>Worked example.</b> The inventory lists R1, R2 and SW1 at documentation addresses. A model asks <code>show_interface</code> for <code>Gi0/0/1</code> on SW1. The server confirms SW1 is in the inventory, matches the interface pattern, builds <code>show interfaces Gi0/0/1</code>, logs the call, and returns the trimmed text.</p></div>
<div class="scn"><h4>The "run_command" tool nobody could take back</h4><p>A pilot exposed a single <code>run_command(device, command)</code> tool because it was quick to build. Within a week a test prompt led the assistant to run a configuration command on a lab switch. No data was lost, but the review concluded that a tool accepting free text cannot be made safe. It was replaced by six narrow show tools.</p><p><b>Lesson:</b> Narrow tools can be reviewed; free text cannot.</p></div>
<div class="iv"><p class="q">"How would you expose show commands to an AI assistant safely?"</p><p>As narrow read-only tools, one per intent, each mapped to a fixed command template. Arguments are limited by a strict schema (device from an inventory enum, interface by pattern, no extra fields) and re-validated in server code. There is no generic run-command tool. I cap output size and call rate, log every call, and keep credentials on the server side.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>One tool per intent, each mapped to one fixed command template.</li><li>Describe tools as read-only and use strict schemas: enum, pattern, no extra fields.</li><li>Validate again in server code; a schema alone is not enforcement.</li><li>Never offer a generic run-command tool.</li><li>Even show commands need output and rate limits.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> sabse safe network tool ek <b>narrow, read-only sawaal</b> hai jiska jawab ka shape fixed ho. Assistant ko keyboard dene ki jagah aap use specific sawaalon ka menu dete ho: "R1 ka version dikhao", "SW1 par interface Gi1 dikhao". Har menu item ek tool hai jo <b>ek fixed command template</b> se map hota hai.</p>
<h3>Bad design aur good design</h3>
<table class="cmp"><tr><th></th><th>Bad: ek tool "run_command"</th><th>Good: har intent ka ek tool</th></tr><tr><td>Model kya bhejta hai</td><td>Jo bhi text woh chahe</td><td>Tool name aur kuch validated arguments</td></tr><tr><td>Kya ho sakta hai</td><td>Jo bhi account allow kare, changes samet</td><td>Sirf listed show commands</td></tr><tr><td>Review kaise karte ho</td><td>Nahi kar sakte</td><td>Templates ki chhoti table padho</td></tr><tr><td>Log kaise karte ho</td><td>Raw strings</td><td>Tool name aur arguments</td></tr></table>
<h3>Achhe tool ki anatomy</h3>
<ul><li><b>Aisa naam jo intent batata hai</b>: <code>show_interface</code>, <code>do_thing</code> nahi.</li><li><b>Aisi description jo batati hai ki yeh read-only hai</b> aur kya lautata hai. Model tools chunne ke liye ise padhta hai, aur human reviewer tool par bharosa karne ke liye.</li><li><b>Strict schema</b>: types, devices ke liye <code>enum</code> (sirf inventory names), interface names ke liye <code>pattern</code>, <code>additionalProperties: false</code> taaki extra fields reject hon.</li><li>Aapke code mein <b>fixed command template</b>. Model values deta hai, command words kabhi nahi.</li><li><b>Bounded jawab</b>: limited length, parsed ya trimmed text, aur saaf error shape.</li></ul>
<p>Yeh ek tool ka schema hai, jaise server publish karega (reference format):</p>
<pre class="code"><span class="c">// Reference tool definition (not run in the simulator)</span>
{
  "name": "show_interface",
  "description": "Read-only. Show one interface on one inventory device. Does not change configuration.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "device":    { "type": "string", "enum": ["R1", "R2", "SW1"] },
      "interface": { "type": "string", "pattern": "^(Gi|Te)[0-9]+(/[0-9]+){0,2}$" }
    },
    "required": ["device", "interface"],
    "additionalProperties": false
  }
}</pre>
<p><code>pattern</code> ek <b>regular expression</b> hai, allowed text ka compact rule. Yahan kehta hai: naam <code>Gi</code> ya <code>Te</code> se shuru ho, phir digits, phir slash aur digits ke do aur groups tak. <code>Gi0/0/1</code> pass hota hai; <code>Gi1; reload</code> nahi, space aur semicolon ki wajah se.</p>
<h3>Wahi rules code mein enforce</h3>
<p>Schema model ke liye documentation hai, lekin model phir bhi uske bahar kuch bhej sakta hai. Isliye server ko apne code mein <b>dobara check</b> karna hoga, har baar. Neeche ka program yahi karta hai aur sach mein chalta hai. Yeh kabhi device se connect nahi hota; sirf woh command banata hai jo <i>bheji jaati</i>, documentation addresses use karke.</p>
<pre class="code">import re

INVENTORY = {"R1": "192.0.2.11", "R2": "192.0.2.12", "SW1": "192.0.2.21"}   # documentation addresses
INTERFACE = re.compile(r"^(Gi|Te)[0-9]+(/[0-9]+){0,2}$")                   # e.g. Gi1 or Gi0/0/1

<span class="c"># One tool per intent. Each maps to ONE fixed command template. No free text from the model.</span>
TOOLS = {
    "show_version":          {"template": "show version",                  "args": ["device"]},
    "show_interfaces_brief": {"template": "show ip interface brief",       "args": ["device"]},
    "show_interface":        {"template": "show interfaces {interface}",   "args": ["device", "interface"]},
}

def build_command(tool, arguments):
    """Return (device_address, command) or raise ValueError with a clear reason."""
    if tool not in TOOLS:
        raise ValueError("unknown tool")
    spec = TOOLS[tool]
    extra = set(arguments) - set(spec["args"])
    if extra:
        raise ValueError("unexpected argument(s): " + ", ".join(sorted(extra)))
    device = arguments.get("device")
    if device not in INVENTORY:
        raise ValueError("device is not in the inventory")
    values = {}
    if "interface" in spec["args"]:
        interface = arguments.get("interface", "")
        if not INTERFACE.fullmatch(interface):
            raise ValueError("interface name is not valid")
        values["interface"] = interface
    return INVENTORY[device], spec["template"].format(**values)

attempts = [
    ("show_interfaces_brief", {"device": "R1"}),
    ("show_interface", {"device": "SW1", "interface": "Gi0/0/1"}),
    ("show_interface", {"device": "R1", "interface": "Gi1; reload"}),
    ("show_version", {"device": "R9"}),
    ("show_version", {"device": "R1", "command": "configure terminal"}),
    ("reload_device", {"device": "R1"}),
]
for tool, args in attempts:
    try:
        address, command = build_command(tool, args)
        print("ALLOW ", tool, "-&gt;", address, ":", command)
    except ValueError as err:
        print("DENY  ", tool, args, "-&gt;", err)</pre>
<pre class="out">ALLOW  show_interfaces_brief -&gt; 192.0.2.11 : show ip interface brief
ALLOW  show_interface -&gt; 192.0.2.21 : show interfaces Gi0/0/1
DENY   show_interface {'device': 'R1', 'interface': 'Gi1; reload'} -&gt; interface name is not valid
DENY   show_version {'device': 'R9'} -&gt; device is not in the inventory
DENY   show_version {'device': 'R1', 'command': 'configure terminal'} -&gt; unexpected argument(s): command
DENY   reload_device {'device': 'R1'} -&gt; unknown tool</pre>
<ul><li><code>re.compile(...)</code> regular expression ek baar taiyaar karta hai; <code>INTERFACE.fullmatch(name)</code> poore naam ko usse test karta hai (match trailing newline accept kar leta hai).</li><li><code>set(arguments) - set(spec["args"])</code> woh arguments dhoondhta hai jo expected nahi hain, isliye extra <code>command</code> field refuse hoti hai.</li><li><code>spec["template"].format(**values)</code> fixed template bharta hai. Sirf validated values andar jaati hain.</li><li>Har refusal chhota, saaf reason deta hai. Model use padhkar agli call theek kar sakta hai; insaan use log mein padh sakta hai.</li></ul>
<p>Paanchwe attempt dekho: model ne <code>command</code> argument jodne ki koshish ki. Woh deny hua, chupchaap ignore nahi. Aur chhatha, <code>reload_device</code>, menu mein hai hi nahi. Kyunki har tool fixed show template hai, aisa koi tool nahi jo device ko badal sake.</p>
<div class="warn"><p><b>Aam galti.</b> Yeh sochna ki "show" commands hamesha harmless hain. Show command dheeme ya bhaari ho sakte hain (jaise bada <code>show tech-support</code>), aur kuch output mein secrets, jaise hashes ya keys, hote hain. Commands soch-samajhkar chuno aur unka output aur rate cap karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Design rules jaano: har intent ka ek tool, fixed templates, strict schemas, schema ke saath server code mein bhi validation, aur koi generic "run any command" tool nahi.</p></div>
<div class="eg"><p><b>Worked example.</b> Inventory mein R1, R2 aur SW1 documentation addresses par hain. Model SW1 par <code>Gi0/0/1</code> ke liye <code>show_interface</code> maangta hai. Server confirm karta hai ki SW1 inventory mein hai, interface pattern match karta hai, <code>show interfaces Gi0/0/1</code> banata hai, call log karta hai, aur trimmed text lautata hai.</p></div>
<div class="scn"><h4>"run_command" tool jise koi wapas nahi le saka</h4><p>Ek pilot ne ek hi <code>run_command(device, command)</code> tool expose kiya kyunki banana jaldi tha. Ek hafte mein test prompt ne assistant se lab switch par configuration command chalwa di. Koi data nahi gaya, lekin review ne nishkarsh nikala ki free text lene wala tool safe nahi banaya ja sakta. Use chhe narrow show tools se badla gaya.</p><p><b>Lesson:</b> Narrow tools review ho sakte hain; free text nahi.</p></div>
<div class="iv"><p class="q">"AI assistant ko show commands safely kaise expose karoge?"</p><p>Narrow read-only tools ki tarah, har intent ka ek, har ek fixed command template se mapped. Arguments strict schema se limited hain (inventory enum se device, pattern se interface, koi extra field nahi) aur server code mein dobara validate hote hain. Koi generic run-command tool nahi. Main output size aur call rate cap karta hoon, har call log karta hoon, aur credentials server side rakhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Har intent ka ek tool, har ek ek fixed command template se mapped.</li><li>Tools ko read-only batao aur strict schemas use karo: enum, pattern, koi extra field nahi.</li><li>Server code mein dobara validate karo; akela schema enforcement nahi hai.</li><li>Kabhi generic run-command tool mat do.</li><li>Show commands ko bhi output aur rate limits chahiye.</li></ul></div>
`}};export{e as default};