import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Recycle, Users, Heart, Lightbulb, TreePine, HandHeart, Phone, Mail, MapPin } from "lucide-react"

export const CivicResponsibilities = () => {
  const responsibilities = [
    {
      title: "Keep Your Environment Clean",
      description: "Dispose of waste properly and participate in community cleanup drives.",
      icon: Recycle,
      image: "https://images.pexels.com/photos/388415/pexels-photo-388415.jpeg",
    },
    {
      title: "Be a Responsible Neighbor",
      description: "Look out for your community and help create a safe environment.",
      icon: Users,
      image: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg",
    },
    {
      title: "Support Local Initiatives",
      description: "Volunteer for projects and support local businesses to boost the economy.",
      icon: Heart,
      image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      title: "Conserve Resources",
      description: "Use water, electricity, and other resources mindfully.",
      icon: Lightbulb,
      image: "https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      title: "Protect Green Spaces",
      description: "Help maintain parks and plant trees in your neighborhood.",
      icon: TreePine,
      image: "https://images.pexels.com/photos/31656834/pexels-photo-31656834.jpeg",
    },
    {
      title: "Help Those in Need",
      description: "Assist vulnerable community members and promote inclusivity.",
      icon: HandHeart,
      image: "https://images.pexels.com/photos/6647118/pexels-photo-6647118.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Your Civic Responsibilities</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Small actions create big changes. Here's how you can contribute to a better community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {responsibilities.map((item, index) => (
            <Card key={index} className="group relative overflow-hidden rounded-lg shadow-lg border-2 border-slate-200/60 hover:border-primary transition-all duration-500 ease-in-out transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/40">
              {/* Image with zoom effect */}
              <div className="h-64 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500" />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

              {/* Content that moves up on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                </div>
                <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div id="contact" className="max-w-4xl mx-auto">
          <Card className="bg-gradient-civic text-white shadow-civic border-2 border-white/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Get in Touch</h3>
                <p className="text-lg text-gray-100">
                  Have questions or need assistance? We're here to help make your community better.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Call Us</h4>
                  <p className="text-gray-200">+1 (555) 123-4567</p>
                  <p className="text-gray-200">24/7 Emergency Line</p>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Email Us</h4>
                  <p className="text-gray-200">support@civicvoice.com</p>
                  <p className="text-gray-200">Response within 24hrs</p>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Visit Us</h4>
                  <p className="text-gray-200">City Hall, Room 201</p>
                  <p className="text-gray-200">Mon-Fri, 9AM-5PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

