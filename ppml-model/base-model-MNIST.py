import torch
import torch.nn as nn
from torch import optim
from torch.autograd import Variable
from torch.utils.data import DataLoader

from torchvision import datasets
from torchvision.transforms import ToTensor

from dask.distributed import Client
# Used solely for clearing the screen because tensor_numpy.cpp
import os

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

train_data = datasets.MNIST(
	root = 'data',
	train = True,
	transform = ToTensor(),
	download = True
)

test_data = datasets.MNIST(
	root = 'data',
	train = False,
	transform = ToTensor()
)

loaders = {
	'train' : torch.utils.data.DataLoader(
		train_data,
		batch_size = 100,
		shuffle = True,
		num_workers = 1
	),
	'test' : torch.utils.data.DataLoader(
		test_data,
		batch_size = 100,
		shuffle = True,
		num_workers = 1
	)
}

class CNN(nn.Module):
	
	def __init__(self):

		super(CNN, self).__init__()
		
		self.conv1 = nn.Sequential(
			nn.Conv2d(
				in_channels=1,
				out_channels=16,
				kernel_size=5,
				stride=1,
				padding=2
			),
			nn.ReLU(),
			nn.MaxPool2d(kernel_size=2)
		)
		self.conv2 = nn.Sequential(
			nn.Conv2d(
				in_channels=16,
				out_channels=32,
				kernel_size=5,
				stride=1,
				padding=2
			),
			nn.ReLU(),
			nn.MaxPool2d(kernel_size=2)
		)

		self.out = nn.Linear(32 * 7 * 7, 10)

	def forward(self, x):

		x = self.conv1(x)
		x = self.conv2(x)

		x = x.view(x.size(0), -1)
		output = self.out(x)
		return output, x


def train(num_epochs, cnn, loaders):

	cnn.train()

	# Train model
	total_step = len(loaders['train'])
	
	for epoch in range(num_epochs):
		for i, (images, labels) in enumerate(loaders['train']):

			# Obtains batch data and normalizes x over train_loader
			b_x = Variable(images)	# Batch x
			b_y = Variable(labels)	# Batch y

			output = cnn(b_x)[0]
			loss = loss_func(output, b_y)

			# Clear gradients on each training step
			optimizer.zero_grad()

			# Compute gradients through backpropagation
			loss.backward()

			# Apply the gradients
			optimizer.step()

			if (i+1) % 100 == 0:
				print(
					'Epoch [{}/{}], Step[{}/{}], Loss: {:.4f}'
					.format(epoch+1, num_epochs, i+1, total_step, loss.item())
				)

def test(cnn):

	cnn.eval()

	with torch.no_grad():
		
		correct = 0
		total = 0

		for images, labels in loaders['test']:

			test_output, last_layer = cnn(images)
			pred_y = torch.max(test_output, 1)[1].data.squeeze()
			accuracy = (pred_y == labels).sum().item() / float(labels.size(0))

	print('Model accuracy on 10000 test images: %.2f' % accuracy)


cnn = CNN()
loss_func = nn.CrossEntropyLoss()
optimizer = optim.Adam(cnn.parameters(), lr = 0.01)
num_epochs = 10

if __name__ == '__main__':
	client = Client()

	os.system('cls' if os.name == 'nt' else 'clear')	# Clear screen

	train(num_epochs, cnn, loaders)
	test(cnn)
