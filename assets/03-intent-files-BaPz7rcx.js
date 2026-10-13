var e={id:`intent-files`,h:{en:`Intent files: YAML, a schema file and every error at once`,hi:`Intent files: YAML, schema file aur har error ek saath`},body:{en:`
<p>In Program 1 you kept inventories in YAML. An <b>intent file</b> is the same idea for a change: not "how to configure" but "what I want", for example which BGP sessions must exist and which prefix is announced under which policy. People write it by hand, so people make typos in it. Stage 1 of the gate is a schema check on this file. This chapter is the first half of Lab 1.</p>

<h3>The change request of Lab 1</h3>
<p>Open <code>intent.yaml</code> on AUTO01. It is the request for CHG-3101, and it contains mistakes on purpose.</p>
<pre class="code">change: CHG-3101
owner: asharma
sessions:
  - {a: xe1, a_ip: 10.0.12.1, b: j1, b_ip: 10.0.12.2, b_asn: 65002}
  - {a: xe1, a_ip: 10.0.13.1, b: e1, b_ip: 10.0.13.300, b_asn: "65003"}
announce:
  - {node: xe1, prefix: 192.0.2.0/24, polcy: RM-CUST-OUT}</pre>
<p>You can probably spot all three: an address ending in .300, an AS number in quotes, and <code>polcy</code> instead of <code>policy</code>. The point is that a script must find them every time, even when the file has 200 lines.</p>

<h3>The rules go in their own file</h3>
<p>Keep the schema in <code>intent.schema.json</code>, next to the data and under version control. Other tools (a web form, a pipeline, an editor) can read the same file. Two features keep it short. <code>$defs</code> holds reusable pieces and <code>$ref</code> points at them, so "an AS number" is defined once.</p>
<pre class="code">{
  "title": "BGP change intent",
  "type": "object",
  "required": ["change", "owner", "sessions", "announce"],
  "additionalProperties": false,
  "properties": {
    "change": {"type": "string", "pattern": "^CHG-[0-9]{4}$"},
    "owner": {"type": "string", "minLength": 3},
    "sessions": {"type": "array", "minItems": 1, "items": {"$ref": "#/$defs/session"}},
    "announce": {"type": "array", "items": {"$ref": "#/$defs/announce"}}
  },
  "$defs": {
    "node": {"enum": ["xe1", "j1", "e1"]},
    "asn": {"type": "integer", "minimum": 1, "maximum": 4294967295},
    "ipv4": {"type": "string", "format": "ipv4"},
    "session": {
      "type": "object",
      "required": ["a", "a_ip", "b", "b_ip", "b_asn"],
      "additionalProperties": false,
      "properties": {
        "a": {"$ref": "#/$defs/node"}, "a_ip": {"$ref": "#/$defs/ipv4"},
        "b": {"$ref": "#/$defs/node"}, "b_ip": {"$ref": "#/$defs/ipv4"},
        "b_asn": {"$ref": "#/$defs/asn"}
      }
    },
    "announce": {
      "type": "object",
      "required": ["node", "prefix", "policy"],
      "additionalProperties": false,
      "properties": {
        "node": {"$ref": "#/$defs/node"},
        "prefix": {"type": "string", "pattern": "^[0-9]{1,3}([.][0-9]{1,3}){3}/[0-9]{1,2}$"},
        "policy": {"type": "string", "minLength": 1}
      }
    }
  }
}</pre>

<h3>Report every error, not only the first</h3>
<p>People fixing a request hate a loop of fix one, run, fix next. So <code>check_intent.py</code> builds a validator and uses <code>iter_errors()</code>, which yields every problem. It sorts them by location so the output is stable, and it exits with 1 when the list is not empty.</p>
<pre class="code">"""check_intent.py - shape check for a change intent file. Usage: python3 check_intent.py intent.yaml"""
import json
import sys

import yaml
from jsonschema import Draft202012Validator, FormatChecker


def load_errors(path, schema_path="intent.schema.json"):
    """Return every schema error in the intent file, sorted by location."""
    with open(schema_path) as f:
        schema = json.load(f)
    with open(path) as f:
        intent = yaml.safe_load(f)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    return sorted(validator.iter_errors(intent), key=lambda e: [str(p) for p in e.absolute_path])


def where(err):
    return "/".join(str(p) for p in err.absolute_path) or "(top level)"


if __name__ == "__main__":
    errors = load_errors(sys.argv[1])
    for err in errors:
        print("%-22s %s" % (where(err), err.message))
    print("%s: %d error(s)" % (sys.argv[1], len(errors)) if errors else "%s: OK" % sys.argv[1])
    sys.exit(1 if errors else 0)</pre>
<pre class="out">AUTO01$ python3 check_intent.py intent.yaml; echo "exit code: $?"
announce/0             'policy' is a required property
announce/0             Additional properties are not allowed ('polcy' was unexpected)
sessions/1/b_asn       '65003' is not of type 'integer'
sessions/1/b_ip        '10.0.13.300' is not a 'ipv4'
<span class="hl">intent.yaml: 4 error(s)</span>
exit code: 1</pre>
<p>Four errors from three typos. Read them top to bottom:</p>
<ul>
<li><code>announce/0</code> appears twice. The typo <code>polcy</code> costs two errors: the required key <code>policy</code> is missing, and <code>polcy</code> is not allowed. Both come from the same mistake.</li>
<li><code>sessions/1/b_asn</code>: the string "65003" is not an integer. This is the most common YAML trap: quotes make a string.</li>
<li><code>sessions/1/b_ip</code>: <code>10.0.13.300</code> is not an <code>ipv4</code>. Hold that thought, it needs one more line of code.</li>
<li>The exit code is 1, so a pipeline stops here.</li>
</ul>

<h3>Four things about errors</h3>
<p>This second script shows the attributes of an error and two traps. Run it next to the same files.</p>
<pre class="code">"""js_intent.py - four things to know about the intent schema"""
import json

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import best_match

with open("intent.schema.json") as f:
    schema = json.load(f)
with open("intent.yaml") as f:
    intent = yaml.safe_load(f)

plain = Draft202012Validator(schema)
strict = Draft202012Validator(schema, format_checker=FormatChecker())
print("errors without FormatChecker:", len(list(plain.iter_errors(intent))))
print("errors with FormatChecker:   ", len(list(strict.iter_errors(intent))))

err = [e for e in strict.iter_errors(intent) if e.validator == "format"][0]
print(err.message)
print("path         ", list(err.absolute_path))
print("json_path    ", err.json_path)
print("schema_path  ", list(err.schema_path))
print("validator    ", err.validator, "=", err.validator_value)
print("instance     ", err.instance)
print("best_match   ", best_match(strict.iter_errors(intent)).message)

port = {
    "if": {"properties": {"mode": {"const": "trunk"}}, "required": ["mode"]},
    "then": {"required": ["allowed_vlans"]},
}
for request in ({"mode": "access"}, {"mode": "trunk"}):
    print(request, [e.message for e in Draft202012Validator(port).iter_errors(request)])</pre>
<pre class="out">AUTO01$ python3 js_intent.py
<span class="hl">errors without FormatChecker: 3</span>
<span class="hl">errors with FormatChecker:    4</span>
'10.0.13.300' is not a 'ipv4'
path          ['sessions', 1, 'b_ip']
json_path     $.sessions[1].b_ip
schema_path   ['properties', 'sessions', 'items', 'properties', 'b_ip', 'format']
validator     format = ipv4
instance      10.0.13.300
<span class="hl">best_match    'policy' is a required property</span>
{'mode': 'access'} []
{'mode': 'trunk'} ["'allowed_vlans' is a required property"]</pre>
<ul>
<li><b>Formats are opt-in.</b> Without <code>format_checker=FormatChecker()</code> the address .300 passes: 3 errors instead of 4. In JSON Schema <code>format</code> is a hint unless you switch checking on.</li>
<li><code>err.path</code> and <code>err.absolute_path</code> are sequences (wrap them in <code>list()</code> to print); <code>err.json_path</code> is the same location as text, handy in a ticket. <code>schema_path</code> tells you which rule fired.</li>
<li><code>best_match</code> picks the one error a human should read first. It is what <code>validate()</code> raises.</li>
<li><code>if</code> and <code>then</code> make a rule depend on a value: "a trunk port needs allowed_vlans". It is how one schema covers several kinds of request.</li>
</ul>

<h3>Fix and prove</h3>
<p>One <code>sed</code> command repairs the three typos. Run the check again and keep the exit code.</p>
<pre class="out">AUTO01$ python3 check_intent.py intent.yaml; echo "exit code: $?"
<span class="hl">intent.yaml: OK</span>
exit code: 0</pre>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab's <code>FormatChecker</code> checks email, idn-email, ipv4, ipv6, regex and date. The real library checks a few more, and some formats (hostname, date-time, uri) need extra packages there too, so do not rely on them. The YAML reader is the lab's PyYAML: stick to plain strings, integers and lists in intent files.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) No <code>FormatChecker</code>, so bad addresses pass. (2) Reading the intent with <code>yaml.load</code> instead of <code>yaml.safe_load</code>. (3) Fixing the first error and ignoring the rest because the script stopped there. (4) Putting meaning in the schema: "b_ip must be inside a_ip's subnet" is a Python or Batfish check.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>iter_errors</code> returns an iterator, not a list, and the errors are in no promised order. Wrap it in <code>sorted(...)</code> with a key if tests or people compare the output.</p></div>

<div class="scn"><h4>The quoted AS number</h4><p>A colleague wrote <code>asn: "65003"</code> because strings felt safer. The Jinja template rendered it fine, the router accepted the text, and every comparison in the audit script ("is 65003 in the allowed list?") returned False. The schema says <code>type: integer</code>; the pipeline now fails with one clear line, <code>'65003' is not of type 'integer'</code>.</p><p><b>Lesson:</b> types in the data matter even when the device does not care.</p></div>

<div class="iv"><p class="q">"How do you validate a YAML change request in a pipeline?"</p><p>I load it with <code>yaml.safe_load</code>, check it against a JSON Schema kept in the repository using <code>Draft202012Validator</code> with a <code>FormatChecker</code>, print every error with its path from <code>iter_errors</code>, and exit 1 if there are any. The same schema can back a web form.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An intent file says what you want; a schema file says what a valid request is.</li>
<li><code>iter_errors</code> reports every problem; sort it so the output is stable.</li>
<li>Format checking is off until you pass a <code>FormatChecker</code>.</li>
<li>One typo can cost several errors; fix by path, not by count.</li>
<li>Exit code 1 turns a check into a gate.</li>
</ul></div>
`,hi:`
<p>Program 1 mein aapne inventories YAML mein rakhi thi. <b>Intent file</b> wahi idea change ke liye hai: "kaise configure karna hai" nahi, balki "mujhe kya chahiye", jaise kaun se BGP sessions maujood hone chahiye aur kaunsa prefix kis policy ke tahat announce hoga. Ise log haath se likhte hain, to log ismein typos karte hain. Gate ka stage 1 is file par schema check hai. Yeh chapter Lab 1 ka pehla aadha hissa hai.</p>

<h3>Lab 1 ki change request</h3>
<p>AUTO01 par <code>intent.yaml</code> kholo. Yeh CHG-3101 ki request hai, aur ismein jaan-boojh kar galtiyan hain.</p>
<pre class="code">change: CHG-3101
owner: asharma
sessions:
  - {a: xe1, a_ip: 10.0.12.1, b: j1, b_ip: 10.0.12.2, b_asn: 65002}
  - {a: xe1, a_ip: 10.0.13.1, b: e1, b_ip: 10.0.13.300, b_asn: "65003"}
announce:
  - {node: xe1, prefix: 192.0.2.0/24, polcy: RM-CUST-OUT}</pre>
<p>Shayad teeno aapko dikh gayi: .300 par khatam hone wala address, quotes mein AS number, aur <code>policy</code> ki jagah <code>polcy</code>. Baat yeh hai ki script ko yeh har baar milni chahiye, chahe file 200 lines ki ho.</p>

<h3>Rules apni file mein</h3>
<p>Schema ko <code>intent.schema.json</code> mein rakho, data ke saath aur version control mein. Doosre tools (web form, pipeline, editor) wahi file padh sakte hain. Do features ise chhota rakhte hain. <code>$defs</code> reusable tukde rakhta hai aur <code>$ref</code> unki taraf ishara karta hai, isliye "AS number" ek hi baar define hota hai.</p>
<pre class="code">{
  "title": "BGP change intent",
  "type": "object",
  "required": ["change", "owner", "sessions", "announce"],
  "additionalProperties": false,
  "properties": {
    "change": {"type": "string", "pattern": "^CHG-[0-9]{4}$"},
    "owner": {"type": "string", "minLength": 3},
    "sessions": {"type": "array", "minItems": 1, "items": {"$ref": "#/$defs/session"}},
    "announce": {"type": "array", "items": {"$ref": "#/$defs/announce"}}
  },
  "$defs": {
    "node": {"enum": ["xe1", "j1", "e1"]},
    "asn": {"type": "integer", "minimum": 1, "maximum": 4294967295},
    "ipv4": {"type": "string", "format": "ipv4"},
    "session": {
      "type": "object",
      "required": ["a", "a_ip", "b", "b_ip", "b_asn"],
      "additionalProperties": false,
      "properties": {
        "a": {"$ref": "#/$defs/node"}, "a_ip": {"$ref": "#/$defs/ipv4"},
        "b": {"$ref": "#/$defs/node"}, "b_ip": {"$ref": "#/$defs/ipv4"},
        "b_asn": {"$ref": "#/$defs/asn"}
      }
    },
    "announce": {
      "type": "object",
      "required": ["node", "prefix", "policy"],
      "additionalProperties": false,
      "properties": {
        "node": {"$ref": "#/$defs/node"},
        "prefix": {"type": "string", "pattern": "^[0-9]{1,3}([.][0-9]{1,3}){3}/[0-9]{1,2}$"},
        "policy": {"type": "string", "minLength": 1}
      }
    }
  }
}</pre>

<h3>Har error report karo, sirf pehla nahi</h3>
<p>Request theek karne waale ko "ek theek karo, chalao, agla theek karo" ka loop bilkul pasand nahi. Isliye <code>check_intent.py</code> validator banata hai aur <code>iter_errors()</code> use karta hai, jo har problem deta hai. Woh unhe location se sort karta hai taaki output stable rahe, aur list khaali na ho to 1 se exit karta hai.</p>
<pre class="code">"""check_intent.py - shape check for a change intent file. Usage: python3 check_intent.py intent.yaml"""
import json
import sys

import yaml
from jsonschema import Draft202012Validator, FormatChecker


def load_errors(path, schema_path="intent.schema.json"):
    """Return every schema error in the intent file, sorted by location."""
    with open(schema_path) as f:
        schema = json.load(f)
    with open(path) as f:
        intent = yaml.safe_load(f)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    return sorted(validator.iter_errors(intent), key=lambda e: [str(p) for p in e.absolute_path])


def where(err):
    return "/".join(str(p) for p in err.absolute_path) or "(top level)"


if __name__ == "__main__":
    errors = load_errors(sys.argv[1])
    for err in errors:
        print("%-22s %s" % (where(err), err.message))
    print("%s: %d error(s)" % (sys.argv[1], len(errors)) if errors else "%s: OK" % sys.argv[1])
    sys.exit(1 if errors else 0)</pre>
<pre class="out">AUTO01$ python3 check_intent.py intent.yaml; echo "exit code: $?"
announce/0             'policy' is a required property
announce/0             Additional properties are not allowed ('polcy' was unexpected)
sessions/1/b_asn       '65003' is not of type 'integer'
sessions/1/b_ip        '10.0.13.300' is not a 'ipv4'
<span class="hl">intent.yaml: 4 error(s)</span>
exit code: 1</pre>
<p>Teen typos se chaar errors. Upar se neeche padho:</p>
<ul>
<li><code>announce/0</code> do baar aaya. Typo <code>polcy</code> do errors ka kharcha deta hai: required key <code>policy</code> missing hai, aur <code>polcy</code> allowed nahi hai. Dono ek hi galti se aate hain.</li>
<li><code>sessions/1/b_asn</code>: string "65003" integer nahi hai. Yeh sabse common YAML trap hai: quotes string bana dete hain.</li>
<li><code>sessions/1/b_ip</code>: <code>10.0.13.300</code> <code>ipv4</code> nahi hai. Ise yaad rakho, iske liye code ki ek line aur chahiye.</li>
<li>Exit code 1 hai, isliye pipeline yahin ruk jaati hai.</li>
</ul>

<h3>Errors ke baare mein chaar baatein</h3>
<p>Yeh doosri script ek error ke attributes aur do traps dikhati hai. Isi files ke saath chalao.</p>
<pre class="code">"""js_intent.py - four things to know about the intent schema"""
import json

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import best_match

with open("intent.schema.json") as f:
    schema = json.load(f)
with open("intent.yaml") as f:
    intent = yaml.safe_load(f)

plain = Draft202012Validator(schema)
strict = Draft202012Validator(schema, format_checker=FormatChecker())
print("errors without FormatChecker:", len(list(plain.iter_errors(intent))))
print("errors with FormatChecker:   ", len(list(strict.iter_errors(intent))))

err = [e for e in strict.iter_errors(intent) if e.validator == "format"][0]
print(err.message)
print("path         ", list(err.absolute_path))
print("json_path    ", err.json_path)
print("schema_path  ", list(err.schema_path))
print("validator    ", err.validator, "=", err.validator_value)
print("instance     ", err.instance)
print("best_match   ", best_match(strict.iter_errors(intent)).message)

port = {
    "if": {"properties": {"mode": {"const": "trunk"}}, "required": ["mode"]},
    "then": {"required": ["allowed_vlans"]},
}
for request in ({"mode": "access"}, {"mode": "trunk"}):
    print(request, [e.message for e in Draft202012Validator(port).iter_errors(request)])</pre>
<pre class="out">AUTO01$ python3 js_intent.py
<span class="hl">errors without FormatChecker: 3</span>
<span class="hl">errors with FormatChecker:    4</span>
'10.0.13.300' is not a 'ipv4'
path          ['sessions', 1, 'b_ip']
json_path     $.sessions[1].b_ip
schema_path   ['properties', 'sessions', 'items', 'properties', 'b_ip', 'format']
validator     format = ipv4
instance      10.0.13.300
<span class="hl">best_match    'policy' is a required property</span>
{'mode': 'access'} []
{'mode': 'trunk'} ["'allowed_vlans' is a required property"]</pre>
<ul>
<li><b>Formats opt-in hain.</b> <code>format_checker=FormatChecker()</code> ke bina address .300 pass ho jaata hai: 4 ki jagah 3 errors. JSON Schema mein <code>format</code> ek hint hai jab tak aap checking on na karo.</li>
<li><code>err.path</code> aur <code>err.absolute_path</code> sequences hain (print karne ke liye <code>list()</code> mein lapeto); <code>err.json_path</code> wahi location text mein hai, ticket mein kaam aata hai. <code>schema_path</code> batata hai kaunsa rule chala.</li>
<li><code>best_match</code> woh ek error chunta hai jo insaan ko pehle padhna chahiye. <code>validate()</code> wahi raise karta hai.</li>
<li><code>if</code> aur <code>then</code> rule ko value par depend karate hain: "trunk port ko allowed_vlans chahiye". Ek schema ek se zyada kism ki request isi tarah sambhalta hai.</li>
</ul>

<h3>Theek karo aur saabit karo</h3>
<p>Ek <code>sed</code> command teeno typos theek kar deta hai. Check dobara chalao aur exit code rakho.</p>
<pre class="out">AUTO01$ python3 check_intent.py intent.yaml; echo "exit code: $?"
<span class="hl">intent.yaml: OK</span>
exit code: 0</pre>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab ka <code>FormatChecker</code> email, idn-email, ipv4, ipv6, regex aur date check karta hai. Real library kuch aur bhi check karti hai, aur kuch formats (hostname, date-time, uri) wahan bhi extra packages maangte hain, isliye unpar bharosa mat karo. YAML reader lab ka PyYAML hai: intent files mein seedhi strings, integers aur lists rakho.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>FormatChecker</code> nahi, isliye bure addresses pass ho jaate hain. (2) Intent ko <code>yaml.safe_load</code> ki jagah <code>yaml.load</code> se padhna. (3) Pehla error theek karke baaki ignore karna kyunki script wahin ruk gayi thi. (4) Matlab ko schema mein daalna: "b_ip a_ip ke subnet ke andar hona chahiye" Python ya Batfish ka check hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>iter_errors</code> iterator return karta hai, list nahi, aur errors ka koi promised order nahi. Agar tests ya log output compare karte hain to ise key ke saath <code>sorted(...)</code> mein lapeto.</p></div>

<div class="scn"><h4>Quotes wala AS number</h4><p>Ek colleague ne <code>asn: "65003"</code> likha kyunki strings zyada surakshit lagti thi. Jinja template ne theek render kiya, router ne text accept kar liya, aur audit script ka har comparison ("kya 65003 allowed list mein hai?") False deta raha. Schema mein <code>type: integer</code> hai; ab pipeline ek saaf line ke saath fail hoti hai, <code>'65003' is not of type 'integer'</code>.</p><p><b>Lesson:</b> data ke types matter karte hain chahe device ko parwah na ho.</p></div>

<div class="iv"><p class="q">"Pipeline mein YAML change request kaise validate karte ho?"</p><p>Main use <code>yaml.safe_load</code> se load karta hoon, repository mein rakhe JSON Schema ke against <code>Draft202012Validator</code> aur <code>FormatChecker</code> ke saath check karta hoon, <code>iter_errors</code> se har error path ke saath print karta hoon, aur koi ho to exit 1. Wahi schema web form ko bhi chala sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent file batati hai aapko kya chahiye; schema file batati hai valid request kya hai.</li>
<li><code>iter_errors</code> har problem report karta hai; output stable rakhne ke liye sort karo.</li>
<li>Format checking tab tak off hai jab tak <code>FormatChecker</code> na do.</li>
<li>Ek typo kai errors ka kharcha de sakta hai; count se nahi, path se theek karo.</li>
<li>Exit code 1 check ko gate bana deta hai.</li>
</ul></div>
`}};export{e as default};