var e={id:`jsonschema-basics`,h:{en:`jsonschema: describe what a valid request looks like`,hi:`jsonschema: batao valid request kaisi dikhti hai`},body:{en:`
<p>Think of the paper form at a bank counter. Name in capitals, account number with ten digits, one box ticked. The clerk does not understand your business; she only checks that the form is filled in as the rules say. <b>JSON Schema</b> is those rules, written as data, and the Python library <b>jsonschema</b> is the clerk. It does not know what a VLAN is. It knows that <code>vlan_id</code> must be an integer between 1 and 4094, and it will refuse anything else before a switch ever sees it.</p>

<h3>A schema is a dictionary of keywords</h3>
<p>A schema describes one value (an object, a list, a number). Inside it, <b>keywords</b> set the rules. The ones you will use every day:</p>
<table class="cmp"><tr><th>Keyword</th><th>Rule</th></tr>
<tr><td><code>type</code></td><td>object, array, string, integer, number, boolean, null</td></tr>
<tr><td><code>required</code></td><td>keys that must be present in an object</td></tr>
<tr><td><code>properties</code></td><td>a schema for each named key</td></tr>
<tr><td><code>additionalProperties</code></td><td>false means "no keys except the listed ones" (catches typos in key names)</td></tr>
<tr><td><code>minimum</code>, <code>maximum</code>, <code>maxLength</code>, <code>minItems</code></td><td>limits on numbers, strings and lists</td></tr>
<tr><td><code>enum</code>, <code>pattern</code></td><td>one of a fixed list; a regular expression the string must match</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="A schema check accepts or rejects a request"><rect x="10" y="62" width="130" height="60" rx="9" fill="#e2e8f0"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">intent.yaml</text><text x="75" y="104" text-anchor="middle" class="svg-ink" font-size="13">a Python dict</text><rect x="215" y="62" width="170" height="60" rx="9" fill="#bae6fd"/><text x="300" y="88" text-anchor="middle" class="svg-ink" font-size="13">Draft202012Validator</text><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="13">intent.schema.json</text><rect x="465" y="20" width="165" height="52" rx="9" fill="#bbf7d0"/><text x="547.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">no errors: go on</text><rect x="465" y="112" width="165" height="58" rx="9" fill="#fed7aa"/><text x="547.5" y="137" text-anchor="middle" class="svg-ink" font-size="13">errors: path + message</text><text x="547.5" y="153" text-anchor="middle" class="svg-ink" font-size="13">BLOCKED</text><line x1="140" y1="92" x2="213" y2="92" stroke="#64748b" stroke-width="2"/><polygon points="213,92 204,97 204,87" fill="#64748b"/><line x1="385" y1="80" x2="463" y2="48" stroke="#64748b" stroke-width="2"/><polygon points="463,48 456.57126421590885,56.04185029818048 452.7757006533458,46.790164114433026" fill="#64748b"/><line x1="385" y1="104" x2="463" y2="138" stroke="#64748b" stroke-width="2"/><polygon points="463,138 452.75180921505455,138.98721103891677 456.7476634201938,129.82025139183253" fill="#64748b"/></svg><p class="cap">iter_errors() returns every problem at once; validate() raises on the first.</p></div>

<h3>The first script</h3>
<p>This script checks a VLAN request. It uses the real library names, so it runs the same on your laptop.</p>
<pre class="code">"""js_basic.py - a VLAN request, checked before anything touches a switch"""
from jsonschema import Draft202012Validator, SchemaError, ValidationError, validate

schema = {
    "type": "object",
    "required": ["name", "vlan_id"],
    "additionalProperties": False,
    "properties": {
        "name": {"type": "string", "maxLength": 32},
        "vlan_id": {"type": "integer", "minimum": 1, "maximum": 4094},
        "role": {"enum": ["access", "voice", "mgmt"]},
    },
}

print(validate({"name": "USERS", "vlan_id": 10}, schema))
requests = [
    {"name": "USERS", "vlan_id": 5000},
    {"name": "USERS", "vlan_id": "10"},
    {"name": "USERS"},
    {"name": "USERS", "vlan_id": 10, "colour": "red"},
    {"name": "USERS", "vlan_id": 10, "role": "guest"},
]
for request in requests:
    try:
        validate(request, schema)
    except ValidationError as err:
        print("%-20s %-12s %s" % (err.validator, list(err.path), err.message))

try:
    validate({"name": "USERS", "vlan_id": 5000}, schema)
except ValidationError as err:
    print(str(err))

checker = Draft202012Validator(schema)
print(checker.is_valid({"name": "USERS", "vlan_id": 10}), checker.is_valid({}))
try:
    Draft202012Validator.check_schema({"type": "int"})
except SchemaError as err:
    print("SchemaError:", err.message)</pre>
<pre class="out">AUTO01$ python3 js_basic.py
None
<span class="hl">maximum              ['vlan_id']  5000 is greater than the maximum of 4094</span>
<span class="hl">type                 ['vlan_id']  '10' is not of type 'integer'</span>
<span class="hl">required             []           'vlan_id' is a required property</span>
<span class="hl">additionalProperties []           Additional properties are not allowed ('colour' was unexpected)</span>
<span class="hl">enum                 ['role']     'guest' is not one of ['access', 'voice', 'mgmt']</span>
<span class="hl">5000 is greater than the maximum of 4094</span>

<span class="hl">Failed validating 'maximum' in schema['properties']['vlan_id']:</span>
<span class="hl">    {'maximum': 4094, 'minimum': 1, 'type': 'integer'}</span>

On instance['vlan_id']:
    5000
True False
SchemaError: 'int' is not valid under any of the given schemas</pre>
<p>Go through the output:</p>
<ul>
<li><code>None</code> on the first line: <code>validate()</code> returns nothing when the data is valid. It does not return True. Writing <code>if validate(...):</code> is therefore always false, a classic bug.</li>
<li>The five lines after it: one per bad request. The first column is the keyword that failed (<code>validator</code>), then the path to the bad value inside the request, then the message. A missing key has an empty path because the problem is the object itself.</li>
<li>Note that <code>"10"</code> as text fails <code>type</code>: JSON Schema is strict, and "10" is not 10.</li>
<li>The long block is <code>str(err)</code>: which keyword failed, in which part of the schema, and on which part of the instance. This is what an uncaught <code>ValidationError</code> prints in a traceback.</li>
<li><code>is_valid()</code> gives a plain True or False when you do not need the reason.</li>
<li>A broken schema raises <code>SchemaError</code>, not <code>ValidationError</code>: here <code>"int"</code> is not a type name. <code>Draft202012Validator.check_schema()</code> tests the schema itself.</li>
</ul>

<h3>validate() or a validator object?</h3>
<p><code>validate(instance, schema)</code> is the quick call. It raises the single most relevant error, picked by <code>best_match</code>. For anything bigger than a demo create a validator object, <code>Draft202012Validator(schema)</code>, because it can report every error (next chapter) and you choose the draft explicitly. Without a <code>$schema</code> key, <code>validate()</code> uses the newest draft. Writing the class name yourself removes the doubt.</p>

<div class="eg"><p><b>Worked example.</b> A portal creates VLANs for branch switches. Without a schema, <code>{"vlan_id": "10"}</code> from a web form becomes the text 10 in a template, and a sort puts "100" before "20". With the schema above the request is rejected at the portal with <code>'10' is not of type 'integer'</code>, and the branch never sees a half-built VLAN.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab's jsonschema is a re-implementation of version 4.23 with the same classes, keywords, error attributes and message texts. Format checks that need extra packages in the real library (hostname, date-time, uri) are not checked in the lab either. Only local references are supported; fetching a remote schema by reference is not.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>additionalProperties: false</code>, so a typo such as <code>polcy</code> is silently accepted as an extra key. (2) Using <code>validate()</code> and expecting a list of errors. (3) Writing YAML like <code>vlan_name: no</code> and getting the Python value False: YAML reads yes, no and on as booleans, so quote strings that look like them.</p></div>
<div class="exam"><p><b>Exam trap.</b> A schema validates <b>structure</b>, not meaning. It will happily accept VLAN 4000 on a platform that reserves it, or an address that is not in the subnet. Checks like that are code, or Batfish.</p></div>

<div class="scn"><h4>Two letters in a key</h4><p>A YAML request had <code>vlan_idd: 20</code>. The template used a default VLAN when the key was missing, so the change deployed VLAN 1 on forty ports. Adding <code>required</code> and <code>additionalProperties: false</code> to the schema turned the same request into two clear errors at the pull request, before anything ran.</p><p><b>Lesson:</b> a schema with no <code>required</code> and no closed property list is only half a check.</p></div>

<div class="iv"><p class="q">"What does validate() return, and what does it raise?"</p><p>It returns None when the instance is valid and raises <code>jsonschema.ValidationError</code> for the best-matching error when it is not. If the schema itself is wrong it raises <code>SchemaError</code>. To get all errors I create a validator and use <code>iter_errors</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A schema is data made of keywords: type, required, properties, limits, enum, pattern.</li>
<li><code>validate()</code> returns None if valid and raises ValidationError if not.</li>
<li>Close the object with <code>additionalProperties: false</code> to catch typos in key names.</li>
<li><code>SchemaError</code> means the schema is broken, not the data.</li>
<li>Schemas check shape, never meaning.</li>
</ul></div>
`,hi:`
<p>Bank ke counter ka paper form sochiye. Naam capitals mein, account number das digits ka, ek box tick. Clerk aapka business nahi samajhti; woh sirf dekhti hai ki form rules ke hisaab se bhara hai. <b>JSON Schema</b> wahi rules hain, data ki shakl mein, aur Python library <b>jsonschema</b> woh clerk hai. Use nahi pata VLAN kya hai. Use bas itna pata hai ki <code>vlan_id</code> 1 se 4094 ke beech integer hona chahiye, aur baaki sab ko woh switch ke dekhne se pehle hi mana kar deti hai.</p>

<h3>Schema keywords ka dictionary hai</h3>
<p>Schema ek value (object, list, number) ko describe karta hai. Uske andar <b>keywords</b> rules tay karte hain. Roz kaam aane wale:</p>
<table class="cmp"><tr><th>Keyword</th><th>Rule</th></tr>
<tr><td><code>type</code></td><td>object, array, string, integer, number, boolean, null</td></tr>
<tr><td><code>required</code></td><td>woh keys jo object mein honi hi chahiye</td></tr>
<tr><td><code>properties</code></td><td>har naam wali key ka schema</td></tr>
<tr><td><code>additionalProperties</code></td><td>false ka matlab "likhi hui keys ke alawa koi key nahi" (key ke naam ke typos pakadta hai)</td></tr>
<tr><td><code>minimum</code>, <code>maximum</code>, <code>maxLength</code>, <code>minItems</code></td><td>numbers, strings aur lists par limits</td></tr>
<tr><td><code>enum</code>, <code>pattern</code></td><td>tay list mein se ek; regular expression jisse string match kare</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Schema check request ko accept ya reject karta hai"><rect x="10" y="62" width="130" height="60" rx="9" fill="#e2e8f0"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">intent.yaml</text><text x="75" y="104" text-anchor="middle" class="svg-ink" font-size="13">ek Python dict</text><rect x="215" y="62" width="170" height="60" rx="9" fill="#bae6fd"/><text x="300" y="88" text-anchor="middle" class="svg-ink" font-size="13">Draft202012Validator</text><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="13">intent.schema.json</text><rect x="465" y="20" width="165" height="52" rx="9" fill="#bbf7d0"/><text x="547.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">koi error nahi: aage badho</text><rect x="465" y="112" width="165" height="58" rx="9" fill="#fed7aa"/><text x="547.5" y="137" text-anchor="middle" class="svg-ink" font-size="13">errors: path + message</text><text x="547.5" y="153" text-anchor="middle" class="svg-ink" font-size="13">BLOCKED</text><line x1="140" y1="92" x2="213" y2="92" stroke="#64748b" stroke-width="2"/><polygon points="213,92 204,97 204,87" fill="#64748b"/><line x1="385" y1="80" x2="463" y2="48" stroke="#64748b" stroke-width="2"/><polygon points="463,48 456.57126421590885,56.04185029818048 452.7757006533458,46.790164114433026" fill="#64748b"/><line x1="385" y1="104" x2="463" y2="138" stroke="#64748b" stroke-width="2"/><polygon points="463,138 452.75180921505455,138.98721103891677 456.7476634201938,129.82025139183253" fill="#64748b"/></svg><p class="cap">iter_errors() saari problems ek saath deta hai; validate() pehli par raise karta hai.</p></div>

<h3>Pehli script</h3>
<p>Yeh script ek VLAN request check karti hai. Yeh real library ke naam use karti hai, isliye aapke laptop par bhi bilkul waise hi chalegi.</p>
<pre class="code">"""js_basic.py - a VLAN request, checked before anything touches a switch"""
from jsonschema import Draft202012Validator, SchemaError, ValidationError, validate

schema = {
    "type": "object",
    "required": ["name", "vlan_id"],
    "additionalProperties": False,
    "properties": {
        "name": {"type": "string", "maxLength": 32},
        "vlan_id": {"type": "integer", "minimum": 1, "maximum": 4094},
        "role": {"enum": ["access", "voice", "mgmt"]},
    },
}

print(validate({"name": "USERS", "vlan_id": 10}, schema))
requests = [
    {"name": "USERS", "vlan_id": 5000},
    {"name": "USERS", "vlan_id": "10"},
    {"name": "USERS"},
    {"name": "USERS", "vlan_id": 10, "colour": "red"},
    {"name": "USERS", "vlan_id": 10, "role": "guest"},
]
for request in requests:
    try:
        validate(request, schema)
    except ValidationError as err:
        print("%-20s %-12s %s" % (err.validator, list(err.path), err.message))

try:
    validate({"name": "USERS", "vlan_id": 5000}, schema)
except ValidationError as err:
    print(str(err))

checker = Draft202012Validator(schema)
print(checker.is_valid({"name": "USERS", "vlan_id": 10}), checker.is_valid({}))
try:
    Draft202012Validator.check_schema({"type": "int"})
except SchemaError as err:
    print("SchemaError:", err.message)</pre>
<pre class="out">AUTO01$ python3 js_basic.py
None
<span class="hl">maximum              ['vlan_id']  5000 is greater than the maximum of 4094</span>
<span class="hl">type                 ['vlan_id']  '10' is not of type 'integer'</span>
<span class="hl">required             []           'vlan_id' is a required property</span>
<span class="hl">additionalProperties []           Additional properties are not allowed ('colour' was unexpected)</span>
<span class="hl">enum                 ['role']     'guest' is not one of ['access', 'voice', 'mgmt']</span>
<span class="hl">5000 is greater than the maximum of 4094</span>

<span class="hl">Failed validating 'maximum' in schema['properties']['vlan_id']:</span>
<span class="hl">    {'maximum': 4094, 'minimum': 1, 'type': 'integer'}</span>

On instance['vlan_id']:
    5000
True False
SchemaError: 'int' is not valid under any of the given schemas</pre>
<p>Output ko line by line padho:</p>
<ul>
<li>Pehli line par <code>None</code>: data valid ho to <code>validate()</code> kuch return nahi karta. Woh True return nahi karta. Isliye <code>if validate(...):</code> hamesha false hota hai, ek classic bug.</li>
<li>Uske baad paanch lines: har galat request ke liye ek. Pehla column woh keyword hai jo fail hua (<code>validator</code>), phir request ke andar galat value ka path, phir message. Missing key ka path khaali hota hai kyunki problem object khud hai.</li>
<li>Dhyan do ki text mein <code>"10"</code> <code>type</code> par fail hota hai: JSON Schema strict hai, "10" aur 10 alag hain.</li>
<li>Lamba block <code>str(err)</code> hai: kaunsa keyword fail hua, schema ke kis hisse mein, aur instance ke kis hisse par. Uncaught <code>ValidationError</code> traceback mein yahi print karta hai.</li>
<li>Jab wajah nahi chahiye tab <code>is_valid()</code> seedha True ya False deta hai.</li>
<li>Toota hua schema <code>ValidationError</code> nahi, <code>SchemaError</code> raise karta hai: yahan <code>"int"</code> type ka naam nahi hai. <code>Draft202012Validator.check_schema()</code> schema ko hi test karta hai.</li>
</ul>

<h3>validate() ya validator object?</h3>
<p><code>validate(instance, schema)</code> quick call hai. Woh sabse relevant ek error raise karta hai, jo <code>best_match</code> chunta hai. Demo se bade kaam ke liye validator object banao, <code>Draft202012Validator(schema)</code>, kyunki woh har error report kar sakta hai (agla chapter) aur draft aap khud chunte ho. <code>$schema</code> key ke bina <code>validate()</code> sabse naya draft use karta hai. Class ka naam khud likhne se shak khatam ho jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek portal branch switches ke liye VLANs banata hai. Schema ke bina web form ka <code>{"vlan_id": "10"}</code> template mein text 10 ban jaata hai, aur sort "100" ko "20" se pehle rakh deta hai. Upar ke schema ke saath request portal par hi <code>'10' is not of type 'integer'</code> ke saath reject ho jaati hai, aur branch ko aadhi bani VLAN kabhi nahi dikhti.</p></div>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab ka jsonschema version 4.23 ka re-implementation hai, wahi classes, keywords, error attributes aur message texts ke saath. Jin format checks ko real library mein extra packages chahiye (hostname, date-time, uri), woh lab mein bhi check nahi hote. Sirf local references chalte hain; reference se remote schema fetch karna nahi chalta.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>additionalProperties: false</code> bhool jaana, isliye <code>polcy</code> jaisa typo extra key ban kar chupchaap accept ho jaata hai. (2) <code>validate()</code> use karke errors ki list ki ummeed. (3) YAML mein <code>vlan_name: no</code> likhna aur Python value False milna: YAML yes, no aur on ko boolean padhta hai, isliye aise dikhne wali strings ko quote karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Schema <b>structure</b> validate karta hai, matlab nahi. Woh us platform par VLAN 4000 khushi se accept kar lega jo use reserve karta hai, ya aisa address jo subnet mein nahi hai. Aise checks code hote hain, ya Batfish.</p></div>

<div class="scn"><h4>Key mein do letters</h4><p>Ek YAML request mein <code>vlan_idd: 20</code> tha. Key missing hone par template default VLAN use karta tha, isliye change ne chalis ports par VLAN 1 deploy kar diya. Schema mein <code>required</code> aur <code>additionalProperties: false</code> jodne se wahi request pull request par hi do saaf errors ban gayi, kuch chalne se pehle.</p><p><b>Lesson:</b> jis schema mein <code>required</code> nahi aur property list band nahi, woh aadha hi check hai.</p></div>

<div class="iv"><p class="q">"validate() kya return karta hai, aur kya raise karta hai?"</p><p>Instance valid ho to None return karta hai, aur na ho to best-matching error ke liye <code>jsonschema.ValidationError</code> raise karta hai. Schema khud galat ho to <code>SchemaError</code>. Saare errors chahiye to main validator banata hoon aur <code>iter_errors</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Schema keywords se bana data hai: type, required, properties, limits, enum, pattern.</li>
<li><code>validate()</code> valid hone par None return karta hai aur na hone par ValidationError raise karta hai.</li>
<li>Key ke naam ke typos pakadne ke liye object ko <code>additionalProperties: false</code> se band karo.</li>
<li><code>SchemaError</code> ka matlab schema toota hai, data nahi.</li>
<li>Schema shape check karta hai, matlab kabhi nahi.</li>
</ul></div>
`}};export{e as default};